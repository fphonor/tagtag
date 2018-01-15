from django.db.models import Q  #noqa

import graphene
from graphene_django import DjangoObjectType

from material.models import Discourse, Title, Question
from label.models import Label #noqa
from account.schema import get_user, UserType


class DiscourseType(DjangoObjectType):
    class Meta:
        model = Discourse


class TitleType(DjangoObjectType):
    class Meta:
        model = Title


class QuestionType(DjangoObjectType):
    class Meta:
        model = Question


class Query(graphene.ObjectType):
    discourses = graphene.List(
        DiscourseType,
        search=graphene.String(),
    )
    titles = graphene.List(TitleType)
    questions = graphene.List(QuestionType)

    def resolve_discourses(self, info, search=None, **kwargs):
        return Discourse.objects.all()

    def resolve_titles(self, info, **kwargs):
        return Title.objects.all()

    def resolve_questions(self, info, **kwargs):
        return Question.objects.all()


class ModifyQuestion(graphene.Mutation):
    question = graphene.Field(QuestionType)

    class Arguments:
        question_id = graphene.Int()
        label_type = graphene.Int()
        label_id = graphene.Int()

    def mutate(self, info, question_id, label_type, label_id):
        user = get_user(info) or None
        if not user:
            raise Exception('You must be logged!')
        question = Question.objects.get(pk=question_id)

        return ModifyQuestion(question=question)


class ModifyTitle(graphene.Mutation):
    id = graphene.Int()
    url = graphene.String()
    description = graphene.String()
    posted_by = graphene.Field(UserType)

    class Arguments:
        url = graphene.String()
        description = graphene.String()

    def mutate(self, info, url, description):
        return ModifyTitle()


class Mutation(graphene.ObjectType):
    modify_title = ModifyTitle.Field()
    modify_question = ModifyQuestion.Field()
