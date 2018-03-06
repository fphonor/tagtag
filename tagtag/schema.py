import graphene

import account.schema
import material.schema
import material.gql


class Query(
        account.schema.Query,
        material.schema.Query,
        material.gql.Query,
        graphene.ObjectType,
):
    pass


class Mutation(
        account.schema.Mutation,
        material.schema.Mutation,
        material.gql.Mutation,
        graphene.ObjectType,
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=False)
