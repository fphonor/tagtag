import requests
import datetime
import csv
from io import StringIO

from django.http import StreamingHttpResponse


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

    print(query_params)
    print('-' * 50)
    print(params)
    print('-' * 50)
    import pdb
    pdb.set_trace()
    url = 'http://54.223.130.63:5000/export'
    r = requests.post(url, data=params).json()
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
    f = get_StringIO_obj(CSV_FIELD_NAMES, r['result'])
    resp = StreamingHttpResponse(f.getvalue(), content_type="text/csv")
    resp['Content-Disposition'] = 'attachment; filename=export_%s.csv' % datetime.datetime.now().strftime('%Y%m%d_%H%M')
    return resp
