import { combineReducers } from 'redux'
import {
  UPDATE_SFFs,
  FIELD_ON_SEARCH,
  FIELD_ON_CHANGE,
  FIELD_SEARCH_FINISHED,
} from '../constant/ActionType'

const LABEL_SFFs = [{
  title: '语言技能', dataIndex: 'skillType', type: 'select',
  options: [{value: "TL", text: "听力"}, {value: "YD", text: "阅读"}, {value: "XZ", text: "写作"},
            {value: "KY", text: "口语"}]
}, {
  title: '标签分类', dataIndex: 'labelType', type: 'select',
  options: [{value: "WJN", text: "微技能"}, {value: "NRKJ", text: "内容框架"}]
}]

const bindListNameWithSearchFormFields = ({LIST_NAME, defaultSFFs}) => {
  return (state=defaultSFFs, action) => {
    switch (action.type) {
      case FIELD_ON_SEARCH:
        return (action.listName === LIST_NAME)
          ? state.map(x => (
              (
                x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
                ? {...x, fetching: true}
                : x
              )
            )
          : state
      case FIELD_SEARCH_FINISHED:
        return (action.listName === LIST_NAME)
          ? state.map(x => (
                (x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
                ? {...x, fetching: false, options: action.options}
                : x
              )
            )
          : state
      case FIELD_ON_CHANGE:
        return (action.listName === LIST_NAME)
          ? state.map(x => (
                (x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
                ? {...x, fetching: false, options: action.options, value: action.value}
                : x
              )
            )
          : state
      default:
        return state
    }
  }
}

const _labels = (state = LABEL_SFFs.concat([{
        title: '一级标签', dataIndex: 'labelName', type: 'select-dynamic',
        options: [],
        fetching: false,
      }]), action) => {
  switch (action.type) {
    case FIELD_ON_SEARCH:
      return (action.listName === 'labels')
        ? state.map(x => (
            (
              x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
              ? {...x, fetching: true}
              : x
            )
          )
        : state
    case FIELD_SEARCH_FINISHED:
      return (action.listName === 'labels')
        ? state.map(x => (
              (x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
              ? {...x, fetching: false, options: action.options}
              : x
            )
          )
        : state
    case FIELD_ON_CHANGE:
      return (action.listName === 'labels')
        ? state.map(x => (
              (x.type === 'select-dynamic' && x.dataIndex === action.dataIndex)
              ? {...x, fetching: false, options: action.options, value: action.value}
              : x
            )
          )
        : state
    default:
      return state
  }
}

const labels = bindListNameWithSearchFormFields({
  LIST_NAME: 'labels',
  defaultSFFs: LABEL_SFFs.concat([{
    title: '一级标签', dataIndex: 'labelName', type: 'select-dynamic',
    options: [],
    fetching: false,
  }])
})
const subLabels = (state = [] , action) => {
  switch (action.type) {
    case UPDATE_SFFs:
      return action.searchFormFields
    default:
      return LABEL_SFFs.concat([{
        title: '一级标签', dataIndex: 'labelName', type: 'select-dynamic',
      }]).map(x => ({...x, showType: 'text',}))
  }
}

const titles = (state = [] , action) => {
  switch (action.type) {
    default: 
      return [
        [{title: '平台', type: 'select', dataIndex: 'platform', options:[]},
         {title: '类型', type: 'select', dataIndex: 'title_type', options:[]},
         {title: '教材', type: 'select-dynamic', dataIndex: 'title_course', options:[],
          fetching: false},
         {title: '单元', type: 'select-dynamic', dataIndex: 'unit_id', options:[],
         fetching: false},
        ], [{
          title: '语篇标注状态',   type: 'select', dataIndex: 'discourse_tag_status',
          options:[{value: "abc", text: "未标注"}]}, {
          title: '语篇评审状态',   type: 'select', dataIndex: 'discourse_review_status',
          options:[{value: "abc", text: "未标注"}]}, {
          title: '微技能标注状态', type: 'select', dataIndex: 'label_tag_status',
          options:[{value: "abc", text: "未标注"}]}, {
          title: '微技能评审状态', type: 'select', dataIndex: 'label_review_status',
          options:[{value: "abc", text: "未标注"}]}
        ], [{
          title: '语篇标注人 ', type: 'select-dynamic', dataIndex: 'discourse_tag_user',
          options: [], fetching: false
        }, {
          title: '语篇评审人', type: 'select-dynamic', dataIndex: 'discourse_review_user',
          options: [], fetching: false
        }, {
          title: '微技能标注人', type: 'select-dynamic', dataIndex: 'label_tag_user',
          options: [], fetching: false
        }, {
          title: '微技能评审人', type: 'select-dynamic', dataIndex: 'label_review_user',
          options: [], fetching: false
        },],
        [{
          title: '语言技能', type: 'select', dataIndex: 'title_category',
          options: [{value: "TL", text: "听力"}, {value: "YD", text: "阅读"}, {value: "XZ", text: "写作"}, {value: "KY", text: "口语"}]
        }, {
          title: '微技能L1', type: 'select-dynamic', dataIndex: 'skill_level_1',
          options: [], fetching: false
        }, {
          title: '微技能L2', type: 'select-dynamic', dataIndex: 'skill_level_2',
          options: [], fetching: false
        }, {
          title: '内容L1', type: 'select-dynamic', dataIndex: 'content_level_1',
          options: [], fetching: false
        }, {
          title: '内容L2', type: 'select-dynamic', dataIndex: 'content_level_2',
          options: [], fetching: false
        },]
      ]
  }
}

export default combineReducers({
  labels,
  subLabels,
  titles,
})
