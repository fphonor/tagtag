import { combineReducers } from 'redux'
import {
  FIELD_ON_SEARCH,
  FIELD_ON_CHANGE,
  FIELD_OPTIONS_CLEAN,
  FIELD_SEARCH_FINISHED,
} from '../constant/ActionType'

const LABEL_SFFs = [{
  title: '语言技能', dataIndex: 'skill_type', type: 'select',
  options: [{value: "TL", text: "听力"}, {value: "YD", text: "阅读"}, {value: "XZ", text: "写作"},
            {value: "KY", text: "口语"}]
}, {
  title: '标签分类', dataIndex: 'label_type', type: 'select',
  options: [{value: "WJN", text: "微技能"}, {value: "NRKJ", text: "内容框架"}]
}]

const bindListNameWithSearchFormFields = ({LIST_NAME, defaultSFFs}) => {
  return (state=defaultSFFs, action) => {
    switch (action.type) {
      case FIELD_ON_SEARCH:
        return (action.listName === LIST_NAME)
          ? state.map(x => {
              const set_fetching = x => (
                (x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
                ? {...x, fetching: true, options: []}
                : x
              )
              return Array.isArray(x) ? x.map(set_fetching) : set_fetching(x)
            })
          : state
      case FIELD_SEARCH_FINISHED:
        return (action.listName === LIST_NAME)
          ? state.map(x => {
              const set_fetching = x => {
                return (x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
                ? {...x, fetching: false, options: action.options}
                : x
              }
              let res = Array.isArray(x) ? x.map(set_fetching) : set_fetching(x)
              return res
            })
          : state
      case FIELD_ON_CHANGE:
        return (action.listName === LIST_NAME)
          ? state.map(x => {
              const set_fetching = x => (
                (x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
                ? {...x, fetching: false, value: action.value}
                : (
                  (x.type === 'select' && x.dataIndex === action.dataIndex)
                  ? {...x, value: action.value}
                  : x
                )
              )
              let res = Array.isArray(x) ? x.map(set_fetching) : set_fetching(x)
              return res
            })
          : state
      case FIELD_OPTIONS_CLEAN:
        return (action.listName === LIST_NAME)
          ? state.map(x => {
              const set_fetching = x => (
                (x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
                ? {...x, options: []}
                : x
              )
              let res = Array.isArray(x) ? x.map(set_fetching) : set_fetching(x)
              return res
            })
          : state
      default:
        return state
    }
  }
}

const gp_labels = bindListNameWithSearchFormFields({
  LIST_NAME: 'gp_labels',
  defaultSFFs: LABEL_SFFs
})

const titles = bindListNameWithSearchFormFields({
  LIST_NAME: 'titles',
  defaultSFFs: [
    [{
      title: '平台',
      type: 'select',
      dataIndex: 'platform',
      value: "u3",
      options:[{value: "u2", text: "u2"}, {value: "u3", text: "u3"}, {value: "itest", text: "itest"}]
    }, {
      title: '类型',
      type: 'select',
      dataIndex: 'title_type',
      value: "教材",
      options:[{value: "题库", text: "题库"}, {value: "教材", text: "教材"}, ]
    }, {
      title: '教材',
      type: 'select-dynamic',
      dataIndex: 'title_course',
      options:[],
      show_pred: (fs) => {
        return fs.find(x => x.dataIndex === 'title_type' && x.value === '教材')
      },
      fetching: false
    }, {
      title: '单元',
      type: 'select-dynamic',
      dataIndex: 'unit_id',
      options: [],
      show_pred: (fs) => {
        return fs.find(x => x.dataIndex === 'title_type' && x.value === '教材')
          && fs.find(x => x.dataIndex === 'title_course' && x.value && x.value.length)
      },
      fetching: false
    }, ], [{
      title: '语篇标注状态',
      type: 'select',
      dataIndex: 'tag_status',
      options:[{value: "", text: "----"}, {value: "待修改", text: "待修改"},{value: "已标注", text: "已标注"}, {value: "未标注", text: "未标注"}]
    }, {
      title: '语篇评审状态',
      type: 'select',
      dataIndex: 'review_status',
      options:[{value: "", text: "----"}, {value: "未评审", text: "未评审"},{value: "评审通过", text: "评审通过"}, {value: "评审未通过", text: "评审未通过"}]
    }, {
      title: '微技能标注状态',
      type: 'select',
      dataIndex: 'label_tag_status',
      options:[{value: "", text: "----"}, {value: "待修改", text: "待修改"},{value: "已标注", text: "已标注"}, {value: "未标注", text: "未标注"}]
    }, {
      title: '微技能评审状态',
      type: 'select',
      dataIndex: 'label_review_status',
      options:[{value: "", text: "----"}, {value: "未评审", text: "未评审"},{value: "评审通过", text: "评审通过"}, {value: "评审未通过", text: "评审未通过"}]
    }], [{
      title: '语篇标注人 ',
      type: 'select-dynamic',
      dataIndex: 'discourse_tag_user',
      options: [],
      fetching: false
    }, {
      title: '语篇评审人',
      type: 'select-dynamic',
      dataIndex: 'discourse_review_user',
      options: [],
      fetching: false
    }, {
      title: '微技能标注人',
      type: 'select-dynamic',
      dataIndex: 'label_tag_user',
      options: [],
      fetching: false
    }, {
      title: '微技能评审人',
      type: 'select-dynamic',
      dataIndex: 'label_review_user',
      options: [],
      fetching: false
    },],
    [{
      title: '语言技能',
      type: 'select',
      dataIndex: 'title_category',
      options: [{value: "听力", text: "听力"}, {value: "阅读", text: "阅读"}, {value: "写作", text: "写作"}, {value: "口语", text: "口语"}]
    }, {
      title: '微技能L1',
      type: 'select-dynamic',
      dataIndex: 'skill_level_1',
      options: [],
      fetching: false
    }, {
      title: '微技能L2',
      type: 'select-dynamic',
      dataIndex: 'skill_level_2',
      options: [],
      fetching: false
    }, {
      title: '内容L1',
      type: 'select-dynamic',
      dataIndex: 'content_level_1',
      options: [],
      fetching: false
    }, {
      title: '内容L2',
      type: 'select-dynamic',
      dataIndex: 'content_level_2',
      options: [],
      fetching: false
    },]
  ]
})

export default combineReducers({
  gp_labels,
  titles,
})
