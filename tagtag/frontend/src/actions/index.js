import {
  ADD_LABEL,
  INIT_LABELS,
  MODIFY_LABEL,
  DELETE_LABEL,
  FETCH_TITLES,
  FETCH_QUESTIONS,
  MODIFY_QUESTIONS,
  FETCH_DISCOURSE,
  MODIFY_DISCOURSE,
  FETCH_TITLE,
  MODIFY_TITLE,
  FIELD_ON_SEARCH,
  FIELD_ON_CHANGE,
  FIELD_OPTIONS_CLEAN,
  FIELD_SEARCH_FINISHED,
  SET_CURRENT_USER,
  CLEAR_CURRENT_USER,
  UPDATE_DEFAULT_LABEL_SEARCH_FIELDS,
} from '../constant/ActionType';
import { getNewKey } from '../util';

import gql from 'graphql-tag'
import { client } from '../graphql'

export const addLabel = ({parent_id, lebal_type, skill_type}) => (dispatch, getState) => {
  dispatch({
    type: ADD_LABEL,
    id: null,
    key: getNewKey(),
    parent_id,
    lebal_type,
    skill_type,
  });
}

export const initLabels = (labels) => ({
  type: INIT_LABELS,
  labels: labels.map(x => ({...x, key: getNewKey()})),
})

export const modifyLabel = label => (dispatch, getState) => {
  dispatch({
    type: MODIFY_LABEL,
    label
  });
}

export const deleteLabel = label => (dispatch, getState) => {
  dispatch({
    type: DELETE_LABEL,
    label: label,
  });
}

export const fetchTitles = () => (dispatch) => {
  return {
    type: FETCH_TITLES,
    titles: [],
  }
}

export const fetchQuestions = () => (dispatch) => {
  return {
    type: FETCH_QUESTIONS,
    questions: [],
  }
}

export const modifyQuestions = () => (dispatch) => {
  return {
    type: MODIFY_QUESTIONS,
    questions: [],
  }
}

export const fetchDiscourse = () => (dispatch) => {
  return {
    type: FETCH_DISCOURSE,
    discourse: [],
  }
}

export const modifyDiscourse = () => (dispatch) => {
  return {
    type: MODIFY_DISCOURSE,
    discourse: [],
  }
}

export const fetchTitle = (titleId) => (dispatch) => {
  return {
    type: FETCH_TITLE,
    title: [],
  }
}

export const modifyTitle = (title) => (dispatch) => {
  return {
    type: MODIFY_TITLE,
    title,
  }
}

const labels_query_params = (value) => {
  return !!value
  ? {
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          gp_labels (nameLike: $nameLike) {
            id label_name label_level skill_type label_type parent_id
          }
        }
      `,
      variables: { nameLike: value },
    }
  : {
      query: gql`
        query OptionsQuery {
          gp_labels {
            id label_name label_level skill_type label_type parent_id
          }
        }
      `,
    }
}

const users_query_params = (value) => ({
  query: gql`
    query UsersQuery {
      users {
        id token username
      }
    }
  `,
  variables: { nameLike: value },
})

const SKILL_TYPES = {'阅读': 'YD', '听力': 'TL'}

const SEARCH_CONF = {
  titles: {
    title_course: {
      query_params: (value) => ({
        query: gql`
          query CoursesQuery {
            gp_courses {
              course_id course_name course_ch_name unit_num
            }
          }
        `,
        variables: { nameLike: value },
      }),
      options_builder: (response, value, fieldList) => response.data.gp_courses
        .map(x => ({value: x.course_id, text: x.course_ch_name, unit_num: x.unit_num}))
        .filter(x => value ? x.text.indexOf(value) !== -1: true)
    },
    unit_id: {
      query_params: (value) => ({
        query: gql`
          query CoursesQuery {
            gp_courses {
              course_id course_name course_ch_name unit_num
            }
          }
        `,
        variables: { nameZhLike: value },
      }),
      options_builder: (response, value, fieldList) => {
        let selected_course_ids = fieldList.find(x => x.dataIndex === 'title_course').value.map(x => x.key);
        let gp_courses = response.data.gp_courses
          .filter(x => selected_course_ids.indexOf(x.course_id) !== -1)

        let options = [].concat(...(gp_courses.map(c => {
          let options = [];
          for (let i=1; i<=c.unit_num; i++) {
            options.push({
              value: i,
              text: `第${i}章`
            })
          }
          return options
        }))).filter(x => value ? x.text.indexOf(value) !== -1: true);
        return options;
      }
    },
    discourse_tag_user: {
      query_params: users_query_params,
      options_builder: (response, value, fieldList) => {
        return response.data.users
          .map(x => ({value: x.id, text: x.username,}))
          .filter(x => value ? x.text.indexOf(value) !== -1: true)
      }
    },
    discourse_review_user: {
      query_params: users_query_params,
      options_builder: (response, value, fieldList) => {
        return response.data.users
          .map(x => ({value: x.id, text: x.username,}))
          .filter(x => value ? x.text.indexOf(value) !== -1: true)
      }
    },
    label_tag_user: {
      query_params: users_query_params,
      options_builder: (response, value, fieldList) => {
        return response.data.users
          .map(x => ({value: x.id, text: x.username,}))
          .filter(x => value ? x.text.indexOf(value) !== -1: true)
      }
    },
    label_review_user: {
      query_params: users_query_params,
      options_builder: (response, value, fieldList) => {
        return response.data.users
          .map(x => ({value: x.id, text: x.username,}))
          .filter(x => value ? x.text.indexOf(value) !== -1: true)
      }
    },
    skill_level_1: {
      query_params: labels_query_params,
      options_builder: ({data: {gp_labels}}, value, fieldList) => {
        let title_category = fieldList.find(x => x.dataIndex ==="title_category")
        return gp_labels
          .filter(x => x.skill_type === SKILL_TYPES[title_category.value])
          .filter(x => x.label_level === 1 && x.label_type === 'WJN')
          .map(x => ({value: x.id, text: x.label_name}))
      }
    },
    skill_level_2: {
      query_params: labels_query_params,
      options_builder: ({data: {gp_labels}}, value, fieldList) => {
        let skill_level_1 = fieldList.find(x => x.dataIndex === 'skill_level_1')
        let title_category = fieldList.find(x => x.dataIndex ==="title_category")
        return gp_labels
          .filter(x => x.skill_type === SKILL_TYPES[title_category.value])
          .filter(x => x.label_level === 2 && x.label_type === 'WJN')
          .filter(x => {
            return skill_level_1.value ? skill_level_1.value.find(y => parseInt(y.key, 10) === x.parent_id) : false
          })
          .map(x => ({value: x.id, text: x.label_name}))
      }
    },
    content_level_1: {
      query_params: labels_query_params,
      options_builder: ({data: {gp_labels}}, value, fieldList) => {
        let title_category = fieldList.find(x => x.dataIndex ==="title_category")
        return gp_labels
          .filter(x => x.skill_type === SKILL_TYPES[title_category.value])
          .filter(x => x.label_level === 1 && x.label_type === 'NRKJ')
          .map(x => ({value: x.id, text: x.label_name}))
      }
    },
    content_level_2: {
      query_params: labels_query_params,
      options_builder: ({data: {gp_labels}}, value, fieldList) => {
        let content_level_1 = fieldList.find(x => x.dataIndex === 'content_level_1')
        let title_category = fieldList.find(x => x.dataIndex ==="title_category")
        return gp_labels
          .filter(x => x.skill_type === SKILL_TYPES[title_category.value])
          .filter(x => x.label_level === 2 && x.label_type === 'NRKJ')
          .filter(x => {
            return content_level_1.value ? content_level_1.value.find(y => parseInt(y.key, 10) === x.parent_id) : false
          })
          .map(x => ({value: x.id, text: x.label_name, parent_id: x.parent_id}))
      }
    },
  },
  lists: {}
}

export const on_search_of_field = (listName, dataIndex, fieldList) => (dispatch, getState) => {
  return value => {
    console.log('on_search_of_field', fieldList, listName, dataIndex, value)
    // if (!value) return
    let action = {
      type: FIELD_ON_SEARCH,
      listName,
      dataIndex,
      value,
    }
    dispatch(action)
    client.query(
      SEARCH_CONF[listName][dataIndex].query_params(value)
    ).then(response => {
      dispatch({
        ...action,
        type: FIELD_SEARCH_FINISHED,
        options: SEARCH_CONF[listName][dataIndex].options_builder(response, value, fieldList),
      })
    })
  }
}

export const on_change_of_field = (listName, dataIndex, fieldList) => (dispatch, getState) => {
  return value => {
    console.log('on_change_of_field', fieldList, listName, dataIndex, value, getState())
    const find_field = (listName, dataIndex) => {
      let list = getState().searchFormFields[listName]
      if (Array.isArray(list[0])) {
        for (let xs of list) {
          for (let x of xs) {
            if (x.dataIndex === dataIndex) {
              return x
            }
          }
        }
      } else {
        for (let x of list) {
          if (x.dataIndex === dataIndex) {
            return x
          }
        }
      }
    }
    let field = find_field(listName, dataIndex)
    if (field.type === 'select-dynamic') {
      let origin_value = field.value
      let dvalue = []
      if (origin_value && origin_value[0]) {
        let real_value = value.filter(x => x.key != origin_value[0].key)
        if (real_value && real_value[0]) {
          dvalue = real_value
        }
      } else {
        dvalue = value
      }
      dispatch({
        type: FIELD_ON_CHANGE,
        listName,
        dataIndex,
        value: dvalue,
      })
    } else {
      dispatch({
        type: FIELD_ON_CHANGE,
        listName,
        dataIndex,
        value,
      })
    }
  }
}

export const field_options_clean = (listName, dataIndex, fieldList) => (dispatch, getState) => {
  return value => {
    console.log('field_options_clean', fieldList, listName, dataIndex, value)
    dispatch({
      type: FIELD_OPTIONS_CLEAN,
      listName,
      dataIndex,
      value,
    })
  }
}

export const update_label_search_field = (label_earch_fields) => {
  return {
    label_earch_fields,
    type: UPDATE_DEFAULT_LABEL_SEARCH_FIELDS,
  }
}

export const setCurrentUser = (currentUser, jwt_token) => {
  if (jwt_token) {
    return {type: SET_CURRENT_USER, currentUser, jwt_token, }
  } else {
    return {type: SET_CURRENT_USER, currentUser, }
  }
}

export const clearCurrentUser = currentUser => {
  return {
    type: CLEAR_CURRENT_USER,
  }
}
