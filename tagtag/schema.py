import graphene

import links.schema
import account.schema
import label.schema


class Query(
        account.schema.Query,
        links.schema.Query,
        label.schema.Query,
        graphene.ObjectType,
):
    pass


class Mutation(
        account.schema.Mutation,
        links.schema.Mutation,
        label.schema.Mutation,
        graphene.ObjectType,
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
