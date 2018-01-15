from graphene_django import DjangoObjectType
import graphene

from label.models import Label
from account.schema import get_user


class LabelType(DjangoObjectType):
    class Meta:
        model = Label


class Query(graphene.ObjectType):
    labels = graphene.List(
        LabelType,
        skill_type=graphene.String(),
        label_type=graphene.String(),
        label_level=graphene.Int(),
        label_name=graphene.String(),
        parent_id=graphene.Int(),
    )
    label = graphene.Field(
        LabelType,
        id=graphene.ID()
    )

    def resolve_labels(self, info, **kwargs):
        return Label.objects.filter(**kwargs).all()

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


class Mutation(graphene.ObjectType):
    create_label= CreateLabel.Field()
