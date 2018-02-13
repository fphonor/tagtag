from django.db.models import Q  #noqa
import requests

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
    titles = graphene.List(
        TitleType,
        platform=graphene.String(), #平台
        title_type=graphene.String(), #类型
        title_course=graphene.String(), #教材
        unit_id=graphene.String(), #单元
        title_category=graphene.String(), #语言技能
        title_info=graphene.String(), #语篇关键字
        tag_status=graphene.String(), #语篇标注状态
        review_status=graphene.String(), #语篇评审状态
        label_tag_status=graphene.String(), #微技能标注状态
        label_review_status=graphene.String(), #微技能评审状态
        label_tag_user=graphene.String(), #微技能标注人
        label_review_user=graphene.String(), #微技能评审人
        discourse_tag_user=graphene.String(), #语篇标注人
        discourse_review_user=graphene.String(), #语篇评审人
        skill_level_1=graphene.String(), #一级微技能
        skill_level_2=graphene.String(), #二级微技能
        content_level_1=graphene.String(), #一级内容标签
        content_level_2=graphene.String(), #二级内容标签
        page_num=graphene.String(), #分页数
        page_size=graphene.String(), #每页显示数量
    )

    questions = graphene.List(QuestionType)

    def resolve_discourses(self, info, search=None, **kwargs):
        return Discourse.objects.all()

    def resolve_titles(self, info, **kwargs):
        url = 'http://54.223.130.63:5000/getEsInfo'
        resp = requests.post(url, data=kwargs)
        res = resp.json()['result']
        return Title.objects.filter(title_ident__in=[x['title_ident'] for x in res])
        import pdb; pdb.set_trace()
        # for r in res:
        #     r.pop('discourse_tag_user')
        #     r.pop('discourse_review_user')
        #     r.pop('tag_status')
        #     r.pop('review_status')
        # return [Title(**r) for r in res]

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
