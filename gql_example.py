import graphene


class UserType(graphene.ObjectType):
    name = graphene.String()
    password = graphene.String()


class Query(graphene.ObjectType):
    hello_person = graphene.String()
    user = graphene.Field(UserType,)
    users = graphene.List(lambda: UserType,)

    def resolve_user(self, info):
        return UserType(**{'name': 'Brian', 'password': '123'})

    def resolve_users(self, info):
        return [UserType(**{'name': 'Brian', 'password': '123'}) for _ in range(5)]


schema = graphene.Schema(query=Query)

res = schema.execute('''
  query {
    helloPerson
    user {name, password }
    users {name, password }
  }
''')
