import graphene
import utils
import requests


class Label(graphene.ObjectType):
    id = graphene.Int()
    label_type = graphene.String()
    label_level = graphene.String()
    label_name = graphene.String()
    parent_id = graphene.Int()
    skill_type = graphene.String()
    # sub_labels = graphene.List(Label)

    # def resolve_sub_labels(self, info):
    #     with utils.get_conn().cursor() as cur:
    #         cur.execute('''
    #             select *
    #             from {table_name}
    #             where parent_id = %(parent_id)s
    #             '''.format(**dict(table_name='label_dict')), dict(parent_id=self.id))
    #         rows = cur.fetchall()
    #         dicts = [dict(zip([c.name for c in cur.description], row)) for row in rows]
    #         return [Question(**d) for d in dicts]


class Discourse(graphene.ObjectType):
    id = graphene.Int()
    discourse_code = graphene.String()
    discourse = graphene.String()
    ls_domain = graphene.String()
    re_domain = graphene.String()
    ls_genre = graphene.String()
    re_genre = graphene.String()
    ls_activity_type = graphene.String()
    ls_authenticity = graphene.String()
    word_num = graphene.Int()
    avg_syllable_num = graphene.Float()
    lemma_num = graphene.Int()
    family_num = graphene.Int()
    common_rate = graphene.Float()
    academic_rate = graphene.Float()
    ls_audio_type = graphene.String()
    ls_audio_all_time = graphene.Float()
    ls_audio_real_time = graphene.Float()
    ls_speed = graphene.Int()
    ls_speed_type = graphene.String()
    ls_voice_type = graphene.String()
    re_familiarity = graphene.Int()
    re_is_chart = graphene.String()
    sentence_num = graphene.Int()
    avg_words_per_sent = graphene.Float()
    re_flesch_kincaid_grade_level = graphene.Float()
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
    ls_speed_syllable = graphene.Float()


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


class TitleList(graphene.ObjectType):
    total_num = graphene.Int()
    page_num = graphene.Int()
    page_size = graphene.Int()
    titles = graphene.List(Title)


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
    titles = graphene.List(
        Title,
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
    gp_labels = graphene.List(
        Label,
        id = graphene.Int(),
        label_type = graphene.String(),
        label_level = graphene.String(),
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

    def resolve_gp_labels(self, info, **kwargs):
        with utils.get_conn().cursor() as cur:
            cur.execute(
                ''' select *
                from {table_name}
                where title_ident = %(title_ident)s
                '''.format(**dict(table_name='label_dict')),
                kwargs
            )
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
        resp = requests.post(url, data=kwargs).json()
        es_rows = resp['result']
        with utils.get_conn().cursor() as cur:
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
            return TitleList(
                total_num=resp['total_num'],
                page_size=kwargs['page_size'],
                page_num=kwargs['page_num'],
                titles=[Title(**d) for d in dicts]
            )


class ChangeLabel(graphene.Mutation):
    label = graphene.Field(Label)

    class Arguments:
        id = graphene.Int()
        label_type = graphene.String()
        label_level = graphene.String()
        label_name = graphene.String()
        parent_id = graphene.Int()
        skill_type = graphene.String()

    def mutate(self, info, **kwargs):
        with utils.get_conn().cursor() as cur:
            columns = kwargs.keys()
            label_id = kwargs.get('id')
            if not label_id:
                cur.execute(
                    '''
                    insert into {table_name} ({columns})
                    values ({values})
                    '''.format(
                        **dict(
                            table_name='label_dict',
                            columns=', '.join(map(str, columns)),
                            values=', '.join(map(lambda x: "%%(%s)s" % x, columns)),
                        )
                    ),
                    kwargs
                )
            else:
                cur.execute(
                    '''
                    update {table_name}
                    set {columns}
                    where id=%(id)s
                    '''.format(**dict(
                        table_name='label_dict',
                        columns=',\n'.join(
                            map(
                                lambda x: '{0} = %({0})s'.format(x),
                                columns
                            )
                        )
                    )),
                    kwargs
                )
            cur.execute(
                ''' select * from {table_name} where {conditions} '''.format(**dict(
                    table_name='label_dict',
                    conditions='\n and '.join(
                        map(lambda x: '{0} = %({0})s'.format(x), kwargs.keys())
                    ))),
                kwargs
            )
            row = cur.fetchone()
            return Label(**dict(zip([c.name for c in cur.description], row)))


class ChangeTitle(graphene.Mutation):
    title = graphene.Field(Title)

    class Arguments:
        title_ident = graphene.String()

    def mutate(self, info, title_ident, **kwargs):
        import pdb
        pdb.set_trace()


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
        with utils.get_conn().cursor() as cur:
            columns = kwargs.keys()
            label_id = kwargs.get('id')
            if not label_id:
                cur.execute(
                    '''
                    insert into {table_name} ({columns})
                    values ({values})
                    '''.format(
                        **dict(
                            table_name='question_detail',
                            columns=', '.join(map(str, columns)),
                            values=', '.join(map(lambda x: "%%(%s)s" % x, columns)),
                        )
                    ),
                    kwargs
                )
            else:
                cur.execute(
                    '''
                    update {table_name}
                    set {columns}
                    where id=%(id)s
                    '''.format(**dict(
                        table_name='question_detail',
                        columns=',\n'.join(
                            map(
                                lambda x: '{0} = %({0})s'.format(x),
                                columns
                            )
                        )
                    )),
                    kwargs
                )
            cur.execute(
                ''' select * from {table_name} where {conditions} '''.format(**dict(
                    table_name='question_detail',
                    conditions='\n and '.join(
                        map(lambda x: '{0} = %({0})s'.format(x), kwargs.keys())
                    ))),
                kwargs
            )
            row = cur.fetchone()
            return Label(**dict(zip([c.name for c in cur.description], row)))


class ChangeDiscourse(graphene.Mutation):
    discourse = graphene.Field(Discourse)

    class Arguments:
        id = graphene.Int()
        discourse_code = graphene.String()
        discourse = graphene.String()
        ls_domain = graphene.String()
        re_domain = graphene.String()
        ls_genre = graphene.String()
        re_genre = graphene.String()
        ls_activity_type = graphene.String()
        ls_authenticity = graphene.String()
        word_num = graphene.Int()
        avg_syllable_num = graphene.Float()
        lemma_num = graphene.Int()
        family_num = graphene.Int()
        common_rate = graphene.Float()
        academic_rate = graphene.Float()
        ls_audio_type = graphene.String()
        ls_audio_all_time = graphene.Float()
        ls_audio_real_time = graphene.Float()
        ls_speed = graphene.Int()
        ls_speed_type = graphene.String()
        ls_voice_type = graphene.String()
        re_familiarity = graphene.Int()
        re_is_chart = graphene.String()
        sentence_num = graphene.Int()
        avg_words_per_sent = graphene.Float()
        re_flesch_kincaid_grade_level = graphene.Float()
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
        ls_speed_syllable = graphene.Float()

    def mutate(self, info, **kwargs):
        table_name = 'discourse_quata'
        return _mutate(table_name, Discourse, kwargs, info)


def _mutate(table_name, Class, kwargs, info):
    with utils.get_conn().cursor() as cur:
        columns = kwargs.keys()
        record_id = kwargs.get('id')
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
            cur.execute(
                '''
                update {table_name}
                set {columns}
                where id=%(id)s
                '''.format(**dict(
                    table_name=table_name,
                    columns=',\n'.join(
                        map(
                            lambda x: '{0} = %({0})s'.format(x),
                            columns
                        )
                    )
                )),
                kwargs
            )
        cur.execute(
            ''' select * from {table_name} where {conditions} '''.format(**dict(
                table_name=table_name,
                conditions='\n and '.join(
                    map(lambda x: '{0} = %({0})s'.format(x), kwargs.keys())
                ))),
            kwargs
        )
        row = cur.fetchone()
        return Class(**dict(zip([c.name for c in cur.description], row)))


class Mutation(graphene.ObjectType):
    change_title = ChangeTitle.Field()
    change_label= ChangeLabel.Field()
    change_question = ChangeQuestion.Field()
    change_discourse = ChangeDiscourse.Field()
