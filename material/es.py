import requests
import json


def search_titles(
        platform, #平台
        title_type, #类型
        title_course, #教材 
        unit_id, #单元
        title_category, #语言技能        
        title_info, #语篇关键字
        tag_status, #语篇标注状态 
        review_status, #语篇评审状态
        label_tag_status, #微技能标注状态 
        label_review_status, #微技能评审状态 
        label_tag_user, #微技能标注人  
        label_review_user, #微技能评审人
        discourse_tag_user, #语篇标注人
        discourse_review_user, #语篇评审人 
        skill_level_1, #一级微技能 
        skill_level_2, #二级微技能 
        content_level_1, #一级内容标签   
        content_level_2, #二级内容标签
        page_num, #分页数
        page_size, #每页显示数量 
):
    query_dict = {}
    query_dict["platform"] = "u3"                        #平台
    query_dict["title_type"] = "教材"                    #类型
    query_dict["title_course"] = " course-v1:Unipus+nhce_3_rw_1+2017_09 "   #教材 
    query_dict["unit_id"] = ""                          #单元
    query_dict["title_category"] = "阅读"                #语言技能        
    query_dict["title_info"] = ""                        #语篇关键字
    query_dict["tag_status"] = ""                        #语篇标注状态 
    query_dict["review_status"] = ""                     #语篇评审状态
    query_dict["label_tag_status"] = ""                  #微技能标注状态 
    query_dict["label_review_status"] = ""               #微技能评审状态 
    query_dict["label_tag_user"] = ""                    #微技能标注人  
    query_dict["label_review_user"] = ""                 #微技能评审人
    query_dict["discourse_tag_user"] = ""                #语篇标注人
    query_dict["discourse_review_user"] = ""             #语篇评审人 
    query_dict["skill_level_1"] = ""                     #一级微技能 
    query_dict["skill_level_2"] = ""                     #二级微技能 
    query_dict["content_level_1"] = ""                   #一级内容标签   
    query_dict["content_level_2"] = ""                   #二级内容标签
    query_dict["page_num"] = "2"                         #分页数
    query_dict["page_size"] = "9"                        #每页显示数量 

    url = 'http://54.223.130.63:5000/getEsInfo'
    resp = requests.post(url, data=query_dict)
    return resp.json()


def update_question_status(updateMap):
    url = 'http://54.223.130.63:5000/updateQueDetail'
    s = json.dumps(updateMap)
    resp = requests.post(url, data=s)
    return resp.json()


def update_discourse_status(updateMap):
    url = 'http://54.223.130.63:5000/updateDiscourse'
    resp = requests.post(url, data=updateMap)
    return resp.json()


if __name__ == '__main__':
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
    import pdb; pdb.set_trace()
