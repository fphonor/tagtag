import requests
import datetime
import csv
from io import StringIO
from itertools import repeat
import utils

from django.http import StreamingHttpResponse, JsonResponse


def get_discourses(req, discourse_ids):
    pass


def post_discourses(req, discourse_ids):
    pass


def get_titles(req, title_ids):
    pass


def post_titles(req, title_ids):
    pass


def get_questions(req, question_ids):
    pass


def post_questions(req, question_ids):
    pass


def get_StringIO_obj(fieldnames, dicts):
    f = StringIO()
    f.write(u'\uFEFF')
    dw = csv.DictWriter(f, fieldnames)
    dw.writeheader()

    for row in dicts:
        dw.writerow(row)
    return f


def export_question_details(req):
    params = {}
    VALID_FIELD_NAMES = [
        "platform",
        "title_type",
        "title_course",
        "unit_id",
        "title_category",
        "title_info",
        "tag_status",
        "review_status",
        "label_tag_status",
        "label_review_status",
        "label_tag_user",
        "label_review_user",
        "discourse_tag_user",
        "discourse_review_user",
        "skill_level_1",
        "skill_level_2",
        "content_level_1",
        "content_level_2",
    ]
    import json
    query_params = json.loads(req.GET['query_params'])
    for field_name in VALID_FIELD_NAMES:
        params[field_name] = query_params.get(field_name, "")

    url = 'http://54.223.130.63:5000/export'
    res = requests.post(url, data=params).json()
    CSV_FIELD_NAMES = [
        "ques_index",
        "skill_level_1",
        "skill_level_2",
        "content_level_1",
        "content_level_2",
        "id",
        "title_ident",
        "title_detail_path",
        "title_course",
        "discourse_tag_user",
        "tag_status",
        "discourse_review_user",
        "label_tag_user",
        "label_tag_status",
        "label_review_user",
        "label_review_status",
        "platform",
        "title_type",
        "title_category",
        "discourse_code",
        "review_status",
        "ls_domain",
        "re_domain",
        "ls_genre",
        "re_genre",
        "ls_activity_type",
        "ls_authenticity",
        "word_num",
        "avg_syllable_num",
        "lemma_num",
        "family_num",
        "common_rate",
        "academic_rate",
        "ls_audio_type",
        "ls_speed_type",
        "ls_speed_syllable",
        "ls_voice_type",
        "re_familiarity",
        "re_is_chart",
        "sentence_num",
        "avg_words_per_sent",
        "re_flesch_kincaid_grade_level",
        "compound_sent_semantic_exten_num",
        "compound_sent_adversative_num",
        "compound_sent_select_num",
        "noun_clauses_num",
        "adjectival_clause_num",
        "adverbial_clauses_num",
    ]

    CSV_FIELD_NAMES = [
        ("ques_index", "小题序号",),
        ("skill_level_1", "1级微技能",),
        ("skill_level_2", "2级微技能",),
        ("content_level_1", "1级内容标签",),
        ("content_level_2", "2级内容标签",),
        ("title_ident", "题目编号",),
        ("title_detail_path", "题目详细路径",),
        ("title_course", "教材",),
        ("discourse_tag_user", "语篇标注人",),
        ("tag_status", "语篇标注状态",),
        ("discourse_review_user", "语篇评审人",),
        ("review_status", "语篇评审状态",),
        ("label_tag_user", "微技能标注人",),
        ("label_tag_status", "微技能标注状态",),
        ("label_review_user", "微技能评审人",),
        ("label_review_status", "微技能评审状态",),
        ("platform", "平台",),
        ("title_type", "类型",),
        ("title_category", "语言技能",),
        ("discourse_code", "语篇编号",),
        ("ls_domain", "听力领域",),
        ("re_domain", "阅读领域",),
        ("ls_genre", "听力文本体裁",),
        ("re_genre", "阅读文本体裁",),
        ("ls_activity_type", "听力活动类型",),
        ("ls_authenticity", "听力素材真实性",),
        ("word_num", "文本词数",),
        ("avg_syllable_num", "平均音节数",),
        ("lemma_num", "词元数",),
        ("family_num", "词族数",),
        ("common_rate", "通用词汇占比",),
        ("academic_rate", "学术词汇占比",),
        ("ls_audio_type", "音频类型",),
        ("ls_speed_type", "语速（wpm）分档",),
        ("ls_speed_syllable", "每分钟音节数",),
        ("ls_voice_type", "口音",),
        ("re_familiarity", "话题熟悉度",),
        ("re_is_chart", "是否包含图表辅助信息",),
        ("sentence_num", "句子数量",),
        ("avg_words_per_sent", "平均词数",),
        ("re_flesch_kincaid_grade_level", "文本可读性指标",),
        ("compound_sent_semantic_exten_num", "并列句-语意引申句子数量",),
        ("compound_sent_adversative_num", "并列句-转折对比句子数量",),
        ("compound_sent_select_num", "并列句-选择句子数量",),
        ("noun_clauses_num", "名词性从句数量",),
        ("adjectival_clause_num", "形容词性从句数量",),
        ("adverbial_clauses_num", "副词性从句数量",),
    ]
    CSV_FIELD_NAME_DICT = dict(CSV_FIELD_NAMES)
    CSV_FIELD_NAMES_ = {fn for (fn, cn) in CSV_FIELD_NAMES}
    f = get_StringIO_obj(
        [cn for (fn, cn) in CSV_FIELD_NAMES],
        [dict(map(lambda x: (CSV_FIELD_NAME_DICT[x[0]], x[1]), filter(lambda x: x[0] in CSV_FIELD_NAMES_, r.items()))) for r in res['result']]
    )
    resp = StreamingHttpResponse(f.getvalue(), content_type="text/csv")
    resp['Content-Disposition'] = 'attachment; filename=export_%s.csv' % datetime.datetime.now().strftime('%Y%m%d_%H%M')
    return resp


def get_statistics_data(req):
    params = {}
    VALID_FIELD_NAMES = [
        "platform",
        "title_type",
        "title_course",
        "unit_id",
        "title_category",
        "title_info",
        "tag_status",
        "review_status",
        "label_tag_status",
        "label_review_status",
        "label_tag_user",
        "label_review_user",
        "discourse_tag_user",
        "discourse_review_user",
        "skill_level_1",
        "skill_level_2",
        "content_level_1",
        "content_level_2",
    ]
    import json
    query_params = json.loads(req.GET['query_params'])
    for field_name in VALID_FIELD_NAMES:
        params[field_name] = query_params.get(field_name, "")
    url = 'http://54.223.130.63:5000/statistics'
    res = requests.post(url, data=params).json()
    print(res)

    def handle_dict(d):
        keys = d.keys()
        print([dict(value=d[k], name=k) for k in keys])
        return [dict(value=d[k], name=k) for k in keys]

    ds = dict([(k, handle_dict(d)) for k, d in res.items()])

    return JsonResponse(ds)


def export_labels(req):
    import json
    query_params = json.loads(req.GET['query_params'])
    CSV_FIELD_NAMES = [
        ("p_skill_type", "标签分类"),
        ("p_label_type", "语言技能"),
        ("p_label_name", "一级标签"),
        ("c_label_name", "二级标签"),
    ]
    with utils.get_conn().cursor() as cur:
        sql = ''' 
            select p.skill_type p_skill_type, p.label_type p_label_type, p.label_name p_label_name, c.label_name c_label_name
            from label_dict p, label_dict c
            where p.id = c.parent_id
            {0}
            order by p_skill_type, p_label_type, p_label_name, c_label_name
        '''.format(
            ' '.join(
                map(
                    lambda xs: ' '.join(xs),
                    zip(
                        repeat('and'),
                        map(
                            lambda x: 'p.%s = %%(%s)s' % (x, x),
                            query_params.keys()
                        )
                    )
                )
            )
        )
        print(sql)
        cur.execute(sql, query_params)
        rows = cur.fetchall()

        VAL_MAP = {
            "TL": "听力",
            "YD": "阅读",
            "XZ": "写作",
            "KY": "口语",

            "WJN": "微技能",
            "NRKJ": "内容框架"
        }
        dicts = [dict(
            zip(
                [c.name for c in cur.description],
                map(lambda x: VAL_MAP[x] if x in VAL_MAP else x, row)
            )
        ) for row in rows]

        CSV_FIELD_NAME_DICT = dict(CSV_FIELD_NAMES)
        CSV_FIELD_NAMES_ = {fn for (fn, cn) in CSV_FIELD_NAMES}
        f = get_StringIO_obj(
            [cn for (fn, cn) in CSV_FIELD_NAMES],
            [dict(map(lambda x: (CSV_FIELD_NAME_DICT[x[0]], x[1]), filter(lambda x: x[0] in CSV_FIELD_NAMES_, r.items()))) for r in dicts]
        )
        resp = StreamingHttpResponse(f.getvalue(), content_type="text/csv")
        resp['Content-Disposition'] = 'attachment; filename=export_%s.csv' % datetime.datetime.now().strftime('%Y%m%d_%H%M')
        return resp
