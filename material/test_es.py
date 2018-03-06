from unittest import TestCase

from .es import update_discourse_status


class APITestCase(TestCase):

    def test_update_discourse_status(self):
        updateMap = dict(
            # 必传参数
            discourse_code="u3_5",
            # 点击 保存 按钮时，传入如下参数：
            # 必传字段：
            tag_status="已标注",
            discourse_tag_user="zhaobo1111",
        )

        # 若是阅读：
        updateMap["re_domain"] = "教育112"
        updateMap["re_familiarity"] = "0"
        updateMap["re_genre"] = "记叙1"
        updateMap["re_is_chart"] = "无"
        updateMap["re_flesch_kincaid_grade_level"] = "6.22"
        # 若是听力：
        updateMap["ls_domain"] = "教育2"
        updateMap["ls_activity_type"] = "听对话"
        updateMap["ls_genre"] = "记叙2"
        updateMap["ls_authenticity"] = "真实语篇"
        updateMap["ls_voice_type"] = "美音"

        # 点击 评审通过 按钮时，传入如下参数：
        updateMap["review_status"] = "评审通过"
        updateMap["discourse_review_user"] = "zhaobo2"

        # 点击 评审通过 按钮时，传入如下参数：
        updateMap["review_status"] = "评审未通过"
        updateMap["discourse_review_user"] = "zhaobo3"
        res = update_discourse_status(updateMap)
        self.assertEqual(res, {'result': 'success'})
