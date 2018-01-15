import graphene as g


class LABEL_TYPES(g.Enum):
    class Meta:
        description="标签分类"

    _0 = "微技能"
    _1 = "内容框架"


class SKILL_TYPES(g.Enum):
    class Meta:
        description="技能分类"

    tl = "听力"
    yd = "阅读" 
    xz = "写作" 
    ky = "口语" 


class Label(g.ObjectType):
    id = g.Int(description="ID")
    label_name = g.String(description="名称")
    parent_id = g.Int(description="父标签ID")  # 根节点父ID默认为0
    label_level = g.Int(description="标签级别")
    skill_type = SKILL_TYPES()

    label_type = LABEL_TYPES()

    def __str__(self):
        return str(self.__dict__)


class Query(g.ObjectType):
    labels = g.List(Label)

    def resolve_labels(self, info):
        return []


class LabelMutation(g.Mutation):

    class Arguments:
        lable = g.Argument(Label)

    label = g.Field(Label)
    label2 = g.String()

    def mutate(self, info, lable):
        label = Label(
            label_name=lable.label_name,
            parent_id=lable.parent_id,
            label_level=lable.label_level,
            label_type=lable.label_type,
            skill_type=lable.skill_type,
        )
        return LabelMutation(label=label, label2=label)


class RootMutation(g.ObjectType):
    label_mutation = LabelMutation.Field()


schema = g.Schema(query=Query, mutation=RootMutation)


def run():
    s = '''
        mutation {
           labelMutation(Lable:{labelName:"name", parentId:3, labelLevel:55,skillType:"华夏", labelType: "zh"}){
               label {labelName} label2
            }
        }
    '''
    return schema.execute(s)
