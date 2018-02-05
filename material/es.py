import requests


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


