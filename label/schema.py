from graphene_django import DjangoObjectType
import graphene

from label.models import Label
from label.models import Course
from account.schema import get_user


class LabelType(DjangoObjectType):
    class Meta:
        model = Label


class CourseType(DjangoObjectType):
    class Meta:
        model = Course


class Query(graphene.ObjectType):
    labels = graphene.List(
        LabelType,
        skill_type=graphene.String(),
        label_type=graphene.String(),
        level=graphene.Int(),
        name=graphene.String(),
        name_like=graphene.String(),
        parent_id=graphene.Int(),
    )
    courses = graphene.List(
        CourseType,
        name_like=graphene.String(),
        name_zh_like=graphene.String(),
    )
    label = graphene.Field(
        LabelType,
        id=graphene.ID()
    )

    def resolve_labels(self, info, name_like=None, **kwargs):
        if name_like:
            return Label.objects.filter(name__contains=name_like)
        return Label.objects.all()

    def resolve_courses(self, info, name_like=None, name_zh_like=None, **kwargs):
        courses = Course.objects
        if name_like:
            courses = courses.filter(name__contains=name_like)
        if name_zh_like:
            courses = courses.filter(name_zh__contains=name_zh_like)
        return courses.all()

    def resolve_label(self, info, id):
        return Label.objects.get(pk=id)


class CreateLabel(graphene.Mutation):
    label = graphene.Field(LabelType)

    class Arguments:
        name = graphene.String()
        parent_id = graphene.Int()
        level = graphene.Int()
        skill_type = graphene.String()
        label_type = graphene.String()

    def mutate(self, info,
               name, level, skill_type, label_type, parent_id=None):
        user = get_user(info) or None
        if not user.is_active:
            raise Exception('User: %s(%s) not active!' % (user.username, user.email))

        label = Label(
            name=name,
            parent_id=parent_id,
            level=level,
            skill_type=skill_type,
            label_type=label_type,
        )
        label.save()

        return CreateLabel(label=label)


class CreateCourse(graphene.Mutation):
    course = graphene.Field(CourseType)

    class Arguments:
        id = graphene.String()
        name = graphene.String()
        name_zh = graphene.String()
        unit_num = graphene.Int()

    def mutate(self, info, id, name, name_zh, unit_num,):
        user = get_user(info) or None
        if not user.is_active:
            raise Exception('User: %s(%s) not active!' % (user.username, user.email))

        course = Course(id=id, name=name, name_zh=name_zh, unit_num=unit_num,)
        course.save()

        return CreateCourse(course=course)


class ModifyLabel(graphene.Mutation):
    label = graphene.Field(LabelType)

    class Arguments:
        name = graphene.String()
        parent_id = graphene.Int()
        level = graphene.Int()
        skill_type = graphene.String()
        label_type = graphene.String()
        id = graphene.ID()

    def mutate(self, info,
               id, name,
               level=None, skill_type=None, label_type=None, parent_id=None):
        user = get_user(info) or None
        if not user.is_active:
            raise Exception('User: %s(%s) not active!' % (user.username, user.email))

        label = Label.objects.get(pk=id)
        label.name = name
        label.save()

        return ModifyLabel(label=label)


class DeleteLabel(graphene.Mutation):
    status = graphene.String()

    class Arguments:
        id = graphene.ID()

    def mutate(self, info, id):
        user = get_user(info) or None
        if not user.is_active:
            raise Exception('User: %s(%s) not active!' % (user.username, user.email))

        label = Label.objects.get(pk=id)
        label.delete()
        return DeleteLabel(status="OK")



class Mutation(graphene.ObjectType):
    create_label = CreateLabel.Field()
    modify_label = ModifyLabel.Field()
    delete_label = DeleteLabel.Field()
    create_course = CreateCourse.Field()
