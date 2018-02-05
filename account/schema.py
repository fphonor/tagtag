from django.contrib.auth import authenticate

import graphene
from graphene_django import DjangoObjectType

from account.models import User


# It tries to get a user from the session content
def get_user(info):
    return User.objects.get(pk=1)

    token = info.context.session.get('token')

    if not token:
        return

    try:
        user = User.objects.get(token=token)
        return user
    except Exception:
        raise Exception('User not found!')


class UserType(DjangoObjectType):
    class Meta:
        model = User


class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)
        role = graphene.String(required=True)

    def mutate(self, info, username, password, email, role):
        if User.objects.filter(username=username).count() > 0:
            raise Exception('username: %s already exists' % username)

        user = User(
            username=username,
            email=email,
            role=role,
        )
        user.set_password(password)
        user.save()

        return CreateUser(user=user)


class Login(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String()
        password = graphene.String()

    def mutate(self, info, username, password):
        user = authenticate(username=username, password=password)

        if not user:
            raise Exception('Invalid username or password!')

        info.context.session['token'] = user.token
        return Login(user=user)


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    login = Login.Field()


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    users = graphene.List(UserType)

    def resolve_users(self, info):
        return User.objects.all()

    def resolve_me(self, info):
        user = get_user(info)
        if not user:
            raise Exception('Not logged!')
        return user
