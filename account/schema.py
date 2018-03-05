from django.contrib.auth import authenticate
from django.settings import JWT_SECRET

import jwt
import graphene
from graphene_django import DjangoObjectType

from account.models import User
from account.utils import get_user


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
    current_user = graphene.Field(UserType)
    jwt_token = graphene.String()

    class Arguments:
        username = graphene.String()
        password = graphene.String()

    def mutate(self, info, username, password):
        user = authenticate(username=username, password=password)

        if not user:
            raise Exception('Invalid username or password!')

        info.context.session['token'] = user.token
        return Login(
            current_user=user,
            jwt_token=jwt.encode(
                {
                    'username': user.username,
                    'token': user.token,
                    'role': user.role,
                }, JWT_SECRET
            )
        )


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
