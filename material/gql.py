import graphene
import utils

from account.utils import get_user
from .es import update_question_status, update_discourse_status


class Course(graphene.ObjectType):
    course_id = graphene.String()
    course_name = graphene.String()
    course_ch_name = graphene.String()
    unit_num = graphene.Int()


class Label(graphene.ObjectType):
    id = graphene.Int()
    label_type = graphene.String()
    label_level = graphene.Int()
    label_name = graphene.String()
    parent_id = graphene.Int()
    skill_type = graphene.String()


class Discourse(graphene.ObjectType):
    id = graphene.Int()
    discourse_code = graphene.String()
    discourse = graphene.String()
    word_num = graphene.Int()
    avg_syllable_num = graphene.Float()
    lemma_num = graphene.Int()
    family_num = graphene.Int()
    common_rate = graphene.Float()
    academic_rate = graphene.Float()
    ls_domain = graphene.String()
    ls_genre = graphene.String()
    ls_activity_type = graphene.String()
    ls_authenticity = graphene.String()
    ls_audio_type = graphene.String()
    ls_audio_all_time = graphene.Float()
    ls_audio_real_time = graphene.Float()
    ls_speed = graphene.Int()
    ls_speed_type = graphene.String()
    ls_speed_syllable = graphene.Float()
    ls_voice_type = graphene.String()
    re_domain = graphene.String()
    re_genre = graphene.String()
    re_familiarity = graphene.Int()
    re_is_chart = graphene.String()
    re_flesch_kincaid_grade_level = graphene.Float()
    sentence_num = graphene.Int()
    avg_words_per_sent = graphene.Float()
    compound_sent_semantic_exten_num = graphene.Int()
    compound_sent_adversative_num = graphene.Int()
    compound_sent_select_num = graphene.Int()
    noun_clauses_num = graphene.Int()
    adjectival_clause_num = graphene.Int()
    adverbial_clauses_num = graphene.Int()
    discourse_tag_user = graphene.String()
    tag_status = graphene.String()
    discourse_review_user = graphene.String()
    review_status = graphene.String()
    review_fail_reason = graphene.String()


class Question(graphene.ObjectType):
    id = graphene.Int()
    question_index = graphene.Int()
    title_ident = graphene.String()
    content_level_1 = graphene.String()
    content_level_2 = graphene.String()
    skill_level_1 = graphene.String()
    skill_level_2 = graphene.String()


class Title(graphene.ObjectType):
    id = graphene.Int()
    platform = graphene.String()
    title_ident = graphene.String()
    title_detail_path = graphene.String()
    title_type = graphene.String()
    title_course = graphene.String()
    title_category = graphene.String()
    title_info = graphene.String()
    title_url = graphene.String()
    video_path = graphene.String()
    version = graphene.String()
    discourse_code = graphene.String()
    block_id = graphene.String()
    label_tag_user = graphene.String()
    label_tag_status = graphene.String()
    label_review_user = graphene.String()
    label_review_status = graphene.String()
    review_fail_reason = graphene.String()
    tutorial_id = graphene.String()
    tutorial_name = graphene.String()
    unit_id = graphene.String()
    unit_name = graphene.String()
    minicoz_id = graphene.String()
    minicoz_name = graphene.String()
    task_id = graphene.String()

    discourse = graphene.Field(Discourse)

    questions = graphene.List(Question)

    def resolve_discourse(self, info):
        with utils.get_conn().cursor() as cur:
            cur.execute('''
                select *
                from {table_name}
                where discourse_code = %(discourse_code)s
                '''.format(**dict(table_name='discourse_quata')), dict(discourse_code=self.discourse_code))
            rows = cur.fetchall()
            dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
            return [Discourse(**d) for d in dicts][0]

    def resolve_questions(self, info):
        with utils.get_conn().cursor() as cur:
            cur.execute('''
                select *
                from {table_name}
                where title_ident = %(title_ident)s
                '''.format(**dict(table_name='question_detail')), dict(title_ident=self.title_ident))
            rows = cur.fetchall()
            dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
            return [Question(**d) for d in dicts]


class TitleRow(graphene.ObjectType):
    id = graphene.Int()
    title_ident = graphene.String()
    title_detail_path = graphene.String()
    title_course = graphene.String()
    discourse_tag_user = graphene.String()
    tag_status = graphene.String()
    discourse_review_user = graphene.String()
    review_status = graphene.String()
    label_tag_user = graphene.String()
    label_tag_status = graphene.String()
    label_review_user = graphene.String()
    label_review_status = graphene.String()
    title_category = graphene.String()


class TitleList(graphene.ObjectType):
    total_num = graphene.Int()
    page_num = graphene.Int()
    page_size = graphene.Int()
    titles = graphene.List(TitleRow)


def update_titles(**kwargs):
    title_ident = kwargs.pop('title_ident')
    if not title_ident:
        raise Exception('title_ident can\'t be empty')
    columns = kwargs.keys()
    column_value_formats = ['%%(%s)s' % column for column in columns]
    sql = 'insert into {table_name} ({columns}) values ({column_value_formats})'.format(**dict(
        table_name='title_bank',
        columns=', '.join(columns),
        column_value_formats=', '.join(column_value_formats),
    ))

    return [], sql


class Query(graphene.ObjectType):
    gp_title = graphene.Field(
        Title,
        title_ident=graphene.String()
    )
    gp_labels = graphene.List(
        Label,
        id = graphene.Int(),
        label_type = graphene.String(),
        label_level = graphene.Int(),
        label_name = graphene.String(),
        parent_id = graphene.Int(),
    )
    gp_titles = graphene.Field(
        TitleList,
        title_ident__in=graphene.List(graphene.String),
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
    gp_titles2 = graphene.Field(
        TitleList,
        title_ident__in=graphene.List(graphene.String),
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
    gp_courses = graphene.List(Course,)

    def resolve_gp_labels(self, info, **kwargs):
        table_name = 'label_dict'
        with utils.get_conn().cursor() as cur:
            if kwargs:
                cur.execute(
                    ''' select * from {table_name} where {conditions} '''.format(**dict(
                        table_name=table_name,
                        conditions='\n and '.join(
                            map(lambda x: '{0} = %({0})s'.format(x), kwargs.keys())
                        ))),
                    kwargs
                )
            else:
                cur.execute('select * from {table_name}'.format(**dict(table_name=table_name)))
            rows = cur.fetchall()
            dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
            return [Label(**d) for d in dicts]

    def resolve_gp_title(self, info, title_ident):
        with utils.get_conn().cursor() as cur:
            cur.execute(
                '''
                select *
                from {table_name}
                where title_ident = %(title_ident)s
                '''.format(**dict(table_name='title_bank')),
                dict(title_ident=title_ident)
            )
            rows = cur.fetchall()
            dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
            return [Title(**d) for d in dicts][0]

    def resolve_gp_titles(self, info, title_ident__in=None, **kwargs):
        url = 'http://54.223.130.63:5000/getEsInfo'
        import requests
        resp = requests.post(url, data=kwargs).json()
        es_rows = resp['result']
        return TitleList(
            total_num=resp['total_num'],
            page_size=kwargs['page_size'],
            page_num=kwargs['page_num'],
            titles=[TitleRow(**d) for d in es_rows],
        )

    def resolve_gp_titles2(self, info, title_ident__in=None, **kwargs):
        url = 'http://54.223.130.63:5000/getEsInfo'
        import requests
        resp = requests.post(url, data=kwargs).json()
        es_rows = resp['result']
        # import pdb; pdb.set_trace()
        # resp = {'total_num': 4, 'page_size': 4, 'page_num': 1}
        # es_rows = [{'title_ident': 'u3_9'}, {'title_ident': 'u3_10'}, {'title_ident': 'u3_2'}, {'title_ident': 'u3_7'}, ]
        with utils.get_conn().cursor() as cur:
            if not es_rows:
                return TitleList(
                    total_num=resp['total_num'],
                    page_size=kwargs['page_size'],
                    page_num=kwargs['page_num'],
                    titles=[]
                )

            cur.execute(
                '''
                select *
                from {table_name}
                where title_ident in %(title_ident__in)s
                '''.format(**dict(table_name='title_bank')),
                dict(title_ident__in=tuple([r['title_ident'] for r in es_rows]))
            )
            rows = cur.fetchall()
            dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
            title_idents = [r['title_ident'] for r in es_rows]
            return TitleList(
                total_num=resp['total_num'],
                page_size=kwargs['page_size'],
                page_num=kwargs['page_num'],
                titles=sorted([Title(**d) for d in dicts], key=lambda t: title_idents.index(t.title_ident))
            )

    def resolve_gp_courses(self, info, **kwargs):
        with utils.get_conn().cursor() as cur:
            cur.execute('select * from {table_name}'.format(**dict(table_name='course_info')),)
            rows = cur.fetchall()
            dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
            return [Course(**d) for d in dicts]


class ChangeLabel(graphene.Mutation):
    label = graphene.Field(Label)

    class Arguments:
        id = graphene.Int()
        label_type = graphene.String()
        label_level = graphene.Int()
        label_name = graphene.String()
        parent_id = graphene.Int()
        skill_type = graphene.String()

    def mutate(self, info, **kwargs):
        table_name = 'label_dict'
        return _mutate(ChangeLabel, "label", table_name, Label, kwargs, info)


class DeleteLabel(graphene.Mutation):
    status = graphene.String()

    class Arguments:
        id = graphene.Int()
        label_type = graphene.String()
        label_level = graphene.Int()
        label_name = graphene.String()
        parent_id = graphene.Int()
        skill_type = graphene.String()

    def mutate(self, info, **kwargs):
        table_name = 'label_dict'
        if get_sub_labels(kwargs['id']):
            raise Exception('请先删除该标签下的子标签')
        return delete_mutate(DeleteLabel, table_name, Label, kwargs, info)


class ChangeTitle(graphene.Mutation):
    title = graphene.Field(Title)

    class Arguments:
        id = graphene.Int()
        platform = graphene.String()
        title_ident = graphene.String()
        title_detail_path = graphene.String()
        title_type = graphene.String()
        title_course = graphene.String()
        title_category = graphene.String()
        title_info = graphene.String()
        title_url = graphene.String()
        video_path = graphene.String()
        version = graphene.String()
        discourse_code = graphene.String()
        block_id = graphene.String()
        label_tag_user = graphene.String()
        label_tag_status = graphene.String()
        label_review_user = graphene.String()
        label_review_status = graphene.String()
        review_fail_reason = graphene.String()
        tutorial_id = graphene.String()
        tutorial_name = graphene.String()
        unit_id = graphene.String()
        unit_name = graphene.String()
        minicoz_id = graphene.String()
        minicoz_name = graphene.String()

    def mutate(self, info, title_ident, **kwargs):
        table_name = 'title_bank'
        return _mutate(ChangeTitle, "title", table_name, Title, kwargs, info)


def update_question_status_to_es(title_ident):
    with utils.get_conn().cursor() as cur:
        title = get_title(title_ident)
        cur.execute(
            'select * from question_detail where title_ident=%(title_ident)s', 
            dict(title_ident=title_ident)
        )
        rows = cur.fetchall()
        questions = [dict(zip([c.name for c in cur.description], r)) for r in rows]

        for question in questions:
            question.pop('id')
            question.pop('title_ident')

        updateMap = dict(
            # 必传参数
            title_ident=title_ident,
            label_tag_status=title.label_tag_status,
            label_tag_user=title.label_tag_user,
            question_detail=questions,
        )
        if title.label_review_status and title.label_review_user:
            # 点击 评审通过 按钮时，传入如下参数：
            updateMap["label_review_status"] = title.label_review_status
            updateMap["label_review_user"] = title.label_review_user
        
        res = update_question_status(updateMap)
        return res


class PushTitle(graphene.Mutation):
    status = graphene.String()

    class Arguments:
        title_ident = graphene.String()

    def mutate(self, info, title_ident):
        user = get_user(info)
        conn = utils.get_conn()
        with conn.cursor() as cur:
            cur.execute(
                '''
                update title_bank
                set label_tag_user = %(username)s,
                    label_tag_status = '已标注'
                where title_ident = %(title_ident)s
                and label_tag_status != '已标注'
                ''',
                dict(title_ident=title_ident, username=user.username)
            )
            # if cur.rowcount != 1:
            #     raise Exception('没有成功更新 title_bank 记录状态，可能记录已标注')

            conn.commit()

        res = update_question_status_to_es(title_ident)
        return PushTitle(status=res['result'])


class PassQuestionDetailReview(graphene.Mutation):
    status = graphene.String()
    title = graphene.Field(Title)

    class Arguments:
        title_ident = graphene.String()

    def mutate(self, info, title_ident):
        user = get_user(info)
        # if user.role != 'manager':
        #     raise Exception('您没有评审权限')
        conn = utils.get_conn()
        with conn.cursor() as cur:
            cur.execute(
                '''
                update title_bank
                set label_review_user = %(username)s,
                    label_review_status = '评审通过',
                    label_tag_status = '已标注'
                where title_ident = %(title_ident)s
                ''',
                # and label_review_status != '评审通过'
                dict(title_ident=title_ident, username=user.username)
            )
            # if cur.rowcount != 1:
            #     raise Exception('没有成功更新 title_bank 记录状态')

            conn.commit()

        res = update_question_status_to_es(title_ident)
        return PassQuestionDetailReview(status=res['result'], title=get_title(title_ident))


class NotPassQuestionDetailReview(graphene.Mutation):
    status = graphene.String()
    title = graphene.Field(Title)

    class Arguments:
        title_ident = graphene.String()
        review_fail_reason = graphene.String()

    def mutate(self, info, title_ident, review_fail_reason):
        user = get_user(info)
        if user is None:
            raise Exception('此操作需要用户登录')
        # if user.role != 'manager':
        #     raise Exception('您没有评审权限')
        conn = utils.get_conn()
        with conn.cursor() as cur:
            cur.execute(
                '''
                update title_bank
                set label_review_user = %(username)s,
                    label_review_status = '评审未通过',
                    review_fail_reason = %(review_fail_reason)s,
                    label_tag_status = '待修改'
                where title_ident = %(title_ident)s
                ''',
                dict(
                    title_ident=title_ident,
                    review_fail_reason=review_fail_reason,
                    username=user.username,
                )
            )
            if cur.rowcount != 1:
                raise Exception('没有成功更新 title_bank 记录状态')

            conn.commit()

        res = update_question_status_to_es(title_ident)
        return NotPassQuestionDetailReview(status=res['result'], title=get_title(title_ident))


def update_discourse_status_to_es(discourse_code):
    with utils.get_conn().cursor() as cur:
        cur.execute(
            'select * from discourse_quata where discourse_code=%(discourse_code)s', 
            dict(discourse_code=discourse_code)
        )
        row = cur.fetchone()
        discourse = dict(zip([c.name for c in cur.description], row))

        updateMap = dict()
        # 必传参数
        for f in [
            "discourse_code",
            "tag_status",
            "discourse_tag_user",
            "word_num",
            "avg_syllable_num",
            "lemma_num",
            "family_num",
            "common_rate",
            "academic_rate",
            "sentence_num",
            "avg_words_per_sent",
            "compound_sent_semantic_exten_num",
            "compound_sent_adversative_num",
            "compound_sent_select_num",
            "noun_clauses_num",
            "adjectival_clause_num",
            "adverbial_clauses_num",
        ]:
            updateMap[f] = discourse[f]

        # 若是阅读：
        READ_FIELDS = [
            "re_domain",
            "re_familiarity",
            "re_genre",
            "re_is_chart",
            "re_flesch_kincaid_grade_level",
        ]

        # 若是阅读：
        if all(map(lambda f: discourse[f], READ_FIELDS)):
            for f in READ_FIELDS:
                updateMap[f] = discourse[f]

        # 若是听力：
        LISTEN_FIELDS = [
            "ls_domain",
            "ls_activity_type",
            "ls_genre",
            "ls_authenticity",
            "ls_voice_type",
            "ls_audio_type",
            "ls_audio_all_time",
            "ls_speed_type",
            "ls_speed_syllable",
        ]
        # 若是听力：,
        if all(map(lambda f: discourse[f], LISTEN_FIELDS)):
            for f in LISTEN_FIELDS:
                updateMap[f] = discourse[f]

        # 点击 评审 的相关按钮时，传入如下参数：
        REVIEW_FIELDS = ["review_status", "discourse_review_user", ]
        if all(map(lambda f: discourse[f], REVIEW_FIELDS)):
            for f in REVIEW_FIELDS:
                updateMap[f] = discourse[f]
        res = update_discourse_status(updateMap)
        return res


class PushDiscourse(graphene.Mutation):
    status = graphene.String()
    discourse = graphene.Field(Discourse)

    class Arguments:
        discourse_code = graphene.String()

    def mutate(self, info, discourse_code):
        user = get_user(info)
        conn = utils.get_conn()
        with conn.cursor() as cur:
            cur.execute(
                '''
                update discourse_quata
                set discourse_tag_user = %(username)s,
                    tag_status = '已标注'
                where discourse_code = %(discourse_code)s
                and tag_status != '已标注'
                ''',
                dict(discourse_code=discourse_code, username=user.username)
            )
            # if cur.rowcount != 1:
            #     raise Exception('没有成功更新 discourse_quata 记录状态，可能记录已标注')

            conn.commit()

        res = update_discourse_status_to_es(discourse_code)
        return PushDiscourse(status=res['result'], discourse=get_discourse(discourse_code))


class PassDiscourseReview(graphene.Mutation):
    status = graphene.String()
    discourse = graphene.Field(Discourse)

    class Arguments:
        discourse_code = graphene.String()

    def mutate(self, info, discourse_code):
        user = get_user(info)
        # if user.role != 'manager':
        #     raise Exception('您没有评审权限')
        conn = utils.get_conn()
        with conn.cursor() as cur:
            cur.execute(
                '''
                update discourse_quata 
                set discourse_review_user = %(username)s,
                    review_status = '评审通过',
                    tag_status = '已标注'
                where discourse_code = %(discourse_code)s
                ''',
                dict(discourse_code=discourse_code, username=user.username,)
            )
            if cur.rowcount != 1:
                raise Exception('没有成功更新 discourse_quata 记录状态')

            conn.commit()

        res = update_discourse_status_to_es(discourse_code)
        return PassDiscourseReview(status=res['result'], discourse=get_discourse(discourse_code))


class NotPassDiscourseReview(graphene.Mutation):
    status = graphene.String()
    discourse = graphene.Field(Discourse)

    class Arguments:
        discourse_code = graphene.String()
        review_fail_reason = graphene.String()

    def mutate(self, info, discourse_code, review_fail_reason):
        user = get_user(info)
        # if user.role != 'manager':
        #     raise Exception('您没有评审权限')
        conn = utils.get_conn()
        with conn.cursor() as cur:
            cur.execute(
                '''
                update discourse_quata
                set discourse_review_user = %(username)s,
                    review_status = '评审未通过',
                    review_fail_reason = %(review_fail_reason)s,
                    tag_status = '待修改'
                where discourse_code = %(discourse_code)s
                ''',
                dict(
                    discourse_code=discourse_code,
                    review_fail_reason=review_fail_reason,
                    username=user.username,
                )
            )
            if cur.rowcount != 1:
                raise Exception('没有成功更新 discourse_quata 记录状态')

            conn.commit()

        res = update_discourse_status_to_es(discourse_code)
        return NotPassDiscourseReview(status=res['result'], discourse=get_discourse(discourse_code))


class ChangeCourse(graphene.Mutation):
    course = graphene.Field(Course)

    class Arguments:
        course_id = graphene.String()
        course_name = graphene.String()
        course_ch_name = graphene.String()
        unit_num = graphene.Int()

    def mutate(self, info, **kwargs):
        table_name = 'course_info'
        return _mutate(ChangeCourse, "course", table_name, Course, kwargs, info)


def get_discourse(discourse_code):
    with utils.get_conn().cursor() as cur:
        cur.execute(
            '''
            select *
            from {table_name}
            where discourse_code= %(discourse_code)s
            '''.format(**dict(table_name='discourse_quata')),
            dict(discourse_code=discourse_code)
        )
        row = cur.fetchone()
        return Discourse(**dict(zip([c.name for c in cur.description], row)))


def get_title(title_ident):
    with utils.get_conn().cursor() as cur:
        cur.execute(
            '''
            select *
            from {table_name}
            where title_ident = %(title_ident)s
            '''.format(**dict(table_name='title_bank')),
            dict(title_ident=title_ident)
        )
        rows = cur.fetchall()
        dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
        return [Title(**d) for d in dicts][0]


def get_labels(label_ids):
    if not label_ids:
        return []
    with utils.get_conn().cursor() as cur:
        cur.execute(
            '''
            select *
            from {table_name}
            where id in %(label_ids)s
            '''.format(**dict(table_name='label_dict')),
            dict(label_ids=tuple(map(int,  filter(lambda x: x, label_ids))))
        )
        rows = cur.fetchall()
        dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
        return [Label(**d) for d in dicts]


def get_sub_labels(label_id):
    with utils.get_conn().cursor() as cur:
        cur.execute(
            '''
            select *
            from {table_name}
            where parent_id = %(label_id)s
            '''.format(**dict(table_name='label_dict')),
            dict(label_id=label_id)
        )
        rows = cur.fetchall()
        dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
        return [Label(**d) for d in dicts]


class ChangeQuestion(graphene.Mutation):
    question = graphene.Field(Question)

    class Arguments:
        id = graphene.Int()
        question_index = graphene.Int()
        title_ident = graphene.String()
        content_level_1 = graphene.String()
        content_level_2 = graphene.String()
        skill_level_1 = graphene.String()
        skill_level_2 = graphene.String()

    def mutate(self, info, **kwargs):
        user = get_user(info)     # noqa
        title = get_title(kwargs.get('title_ident'))  # noqa
        table_name = 'question_detail'
        res = _mutate(ChangeQuestion, "question", table_name, Question, kwargs, info)
        return res


class DeleteQuestion(graphene.Mutation):
    status = graphene.String()

    class Arguments:
        id = graphene.Int()
        question_index = graphene.Int()
        title_ident = graphene.String()
        content_level_1 = graphene.String()
        content_level_2 = graphene.String()
        skill_level_1 = graphene.String()
        skill_level_2 = graphene.String()

    def mutate(self, info, **kwargs):
        table_name = 'question_detail'
        delete_mutate(DeleteQuestion, table_name, Question, kwargs, info)
        es_res = update_question_status_to_es(kwargs['title_ident'])
        return DeleteQuestion(status=es_res['result'])


class ChangeDiscourse(graphene.Mutation):
    discourse = graphene.Field(Discourse)

    class Arguments:
        academic_rate = graphene.Float()
        adjectival_clause_num = graphene.Int()
        adverbial_clauses_num = graphene.Int()
        avg_syllable_num = graphene.Float()
        avg_words_per_sent = graphene.Float()
        common_rate = graphene.Float()
        compound_sent_adversative_num = graphene.Int()
        compound_sent_select_num = graphene.Int()
        compound_sent_semantic_exten_num = graphene.Int()
        discourse = graphene.String()
        discourse_code = graphene.String()
        family_num = graphene.Int()
        id = graphene.Int()
        lemma_num = graphene.Int()
        ls_activity_type = graphene.String()
        ls_audio_all_time = graphene.Float()
        ls_audio_real_time = graphene.Float()
        ls_audio_type = graphene.String()
        ls_authenticity = graphene.String()
        ls_domain = graphene.String()
        ls_genre = graphene.String()
        ls_speed = graphene.Int()
        ls_speed_syllable = graphene.Float()
        ls_speed_type = graphene.String()
        ls_voice_type = graphene.String()
        noun_clauses_num = graphene.Int()
        re_domain = graphene.String()
        re_familiarity = graphene.Int()
        re_flesch_kincaid_grade_level = graphene.Float()
        re_genre = graphene.String()
        re_is_chart = graphene.String()
        sentence_num = graphene.Int()
        word_num = graphene.Int()

    def mutate(self, info, **kwargs):
        table_name = 'discourse_quata'
        return _mutate(ChangeDiscourse, 'discourse', table_name, Discourse, kwargs, info)


def _mutate(MutationClass, res_field_name, table_name, Class, kwargs, info, pk='id'):
    conn = utils.get_conn()
    with conn.cursor() as cur:
        columns = kwargs.keys()
        record_id = kwargs.get(pk)
        if not record_id:
            cur.execute(
                '''
                insert into {table_name} ({columns})
                values ({values})
                '''.format(
                    **dict(
                        table_name=table_name,
                        columns=', '.join(map(str, columns)),
                        values=', '.join(map(lambda x: "%%(%s)s" % x, columns)),
                    )
                ),
                kwargs
            )
        else:
            # cur.execute(
            #     ''' 
            #         select *
            #         from {table_name}
            #         where {pk}=%({pk})s
            #     '''.format(pk=pk, table_name=table_name),
            #     kwargs
            # )
            # row = cur.fetchone()

            cur.execute(
                '''
                update {table_name}
                set {columns}
                where {pk}=%({pk})s
                '''.format(**dict(
                    table_name=table_name,
                    columns=',\n'.join(
                        map(
                            lambda x: '{0} = %({0})s'.format(x),
                            filter(lambda c: c != pk, columns)
                        )
                    ),
                    pk=pk,
                )),
                kwargs
            )
        conn.commit()
        cur.execute(
            ''' select * from {table_name} where {conditions} '''.format(**dict(
                table_name=table_name,
                conditions='\n and '.join(
                    map(lambda x: '{0} = %({0})s'.format(x), kwargs.keys())
                ))),
            kwargs
        )
        row = cur.fetchone()
        return MutationClass(
            **{
                res_field_name: Class(**dict(zip([c.name for c in cur.description], row)))
            }
        )


def delete_mutate(MutationClass, table_name, Class, kwargs, info, status='ok'):
    conn = utils.get_conn()
    with conn.cursor() as cur:
        cur.execute(
            '''
            delete from {table_name}
            where {conditions}
            '''.format(
                **dict(
                    table_name=table_name,
                    conditions='\n and '.join(
                        map(lambda x: '{0} = %({0})s'.format(x), kwargs.keys())
                    ))),
            kwargs
        )
        conn.commit()
        return MutationClass(status=status)


class Mutation(graphene.ObjectType):
    change_title = ChangeTitle.Field()
    push_title = PushTitle.Field()
    push_discourse = PushDiscourse.Field()
    change_label = ChangeLabel.Field()
    delete_label = DeleteLabel.Field()
    change_question = ChangeQuestion.Field()
    delete_question = DeleteQuestion.Field()
    pass_question_detail_review = PassQuestionDetailReview.Field()
    not_pass_question_detail_review = NotPassQuestionDetailReview.Field()
    pass_discourse_review = PassDiscourseReview.Field()
    not_pass_discourse_review = NotPassDiscourseReview.Field()
    change_discourse = ChangeDiscourse.Field()
