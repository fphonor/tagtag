from django.db.models import Q

import graphene
from graphene_django import DjangoObjectType

from links.models import Link, Vote
from account.schema import get_user, UserType


class LinkType(DjangoObjectType):
    class Meta:
        model = Link


class VoteType(DjangoObjectType):
    class Meta:
        model = Vote


class Query(graphene.ObjectType):
    links = graphene.List(
        LinkType,
        search=graphene.String(),
        first=graphene.Int(),
        skip=graphene.Int(),
    )
    votes = graphene.List(VoteType)

    def resolve_links(self, info, search=None, skip=None, first=None, **kwargs):
        print(skip, first, search)
        qs = Link.objects.all()
        # The value sent with the search parameter will be on the args variable
        if search:
            filter = (
                Q(url__icontains=search) | 
                Q(description__icontains=search)
            )
            qs = qs.filter(filter)

        if skip:
            qs = qs[skip::]

        if first:
            qs = qs[first::]

        lin = Link(id=3, url="Brian", description="ABC")
        user = get_user(info) or None

        def get_queryset(*args, **kwargs):
            return [
                Vote(link=lin, user=user, id=33),
                Vote(link=lin, user=user, id=33),
                Vote(link=lin, user=user, id=33),
            ]

        lin.votes.set(get_queryset(), bulk=False)
        qs = [
            lin,
            Link(id=4, url="Brian", description="ABC"),
            Link(id=5, url="Brian", description="ABC"),
        ]
        return qs

    def resolve_votes(self, info, **kwargs):
        return Vote.objects.all()


class CreateVote(graphene.Mutation):
    user = graphene.Field(UserType)
    link = graphene.Field(LinkType)

    class Arguments:
        link_id = graphene.Int()

    def mutate(self, info, link_id):
        user = get_user(info) or None
        if not user:
            raise Exception('You must be logged to vote!')

        link = Link.objects.filter(id=link_id).first()
        if not link:
            raise Exception('Invalid Link!')

        Vote.objects.create(
            user=user,
            link=link,
        )

        return CreateVote(user=user, link=link)


class CreateLink(graphene.Mutation):
    id = graphene.Int()
    url = graphene.String()
    description = graphene.String()
    posted_by = graphene.Field(UserType)

    class Arguments:
        url = graphene.String()
        description = graphene.String()

    def mutate(self, info, url, description):
        user = get_user(info) or None

        link = Link(
            url=url,
            description=description,
            posted_by=user,
        )
        link.save()

        return CreateLink(
            id=link.id,
            url=link.url,
            description=link.description,
            posted_by=link.posted_by,
        )


class Mutation(graphene.ObjectType):
    create_link = CreateLink.Field()
    create_vote = CreateVote.Field()
