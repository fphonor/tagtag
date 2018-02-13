import graphene

import links.schema
import account.schema
import label.schema
import material.schema
import material.gql


class Query(
        account.schema.Query,
        links.schema.Query,
        label.schema.Query,
        material.schema.Query,
        material.gql.Query,
        graphene.ObjectType,
):
    pass


class Mutation(
        account.schema.Mutation,
        links.schema.Mutation,
        label.schema.Mutation,
        material.schema.Mutation,
        material.gql.Mutation,
        graphene.ObjectType,
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=False)
