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
        label_level=graphene.Int(),
        label_name=graphene.String(),
        label_name_like=graphene.String(),
        parent_id=graphene.Int(),
    )
    courses = graphene.List(
        CourseType,
        course_name_like=graphene.String(),
        course_ch_name_like=graphene.String(),
    )
    label = graphene.Field(
        LabelType,
        id=graphene.ID()
    )

    def resolve_labels(self, info, label_name_like=None, **kwargs):
        if label_name_like:
            return Label.objects.filter(label_name__contains=label_name_like)
        return Label.objects.all()

    def resolve_courses(self, info, course_name_like=None, course_ch_name_like=None, **kwargs):
        courses = Course.objects
        if course_name_like:
            courses = courses.filter(course_name__contains=course_name_like)
        if course_ch_name_like:
            courses = courses.filter(course_ch_name__contains=course_ch_name_like)
        return courses.all()

    def resolve_label(self, info, id):
        return Label.objects.get(pk=id)


class CreateLabel(graphene.Mutation):
    label = graphene.Field(LabelType)

    class Arguments:
        label_name = graphene.String()
        parent_id = graphene.Int()
        label_level = graphene.Int()
        skill_type = graphene.String()
        label_type = graphene.String()

    def mutate(self, info,
               label_name, label_level, skill_type, label_type, parent_id=None):
        user = get_user(info) or None
        if not user.is_active:
            raise Exception('User: %s(%s) not active!' % (user.username, user.email))

        label = Label(
            label_name=label_name,
            parent_id=parent_id,
            label_level=label_level,
            skill_type=skill_type,
            label_type=label_type,
        )
        label.save()

        return CreateLabel(label=label)


class CreateCourse(graphene.Mutation):
    course = graphene.Field(CourseType)

    class Arguments:
        course_id = graphene.String()
        course_name = graphene.String()
        course_ch_name = graphene.String()
        unit_num = graphene.Int()

    def mutate(self, info, course_id, course_name, course_ch_name, unit_num,):
        user = get_user(info) or None
        if not user.is_active:
            raise Exception('User: %s(%s) not active!' % (user.username, user.email))

        course = Course(
            course_id=course_id,
            course_name=course_name,
            course_ch_name=course_ch_name,
            unit_num=unit_num,
        )
        course.save()

        return CreateCourse(course=course)


class ModifyLabel(graphene.Mutation):
    label = graphene.Field(LabelType)

    class Arguments:
        label_name = graphene.String()
        parent_id = graphene.Int()
        label_level = graphene.Int()
        skill_type = graphene.String()
        label_type = graphene.String()
        id = graphene.ID()

    def mutate(self, info,
               id, label_name,
               label_level=None, skill_type=None, label_type=None, parent_id=None):
        user = get_user(info) or None
        if not user.is_active:
            raise Exception('User: %s(%s) not active!' % (user.username, user.email))

        label = Label.objects.get(pk=id)
        label.label_name = label_name
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
