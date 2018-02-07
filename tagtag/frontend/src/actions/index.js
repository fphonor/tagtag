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
  UPDATE_DEFAULT_LABEL_SEARCH_FIELDS,
} from '../constant/ActionType';
import { getNewKey } from '../util';

import gql from 'graphql-tag'
import { client } from '../graphql'

export const addLabel = ({parentId, lebalType, skillType}) => (dispatch, getState) => {
  dispatch({
    type: ADD_LABEL,
    id: null,
    key: getNewKey(),
    parentId,
    lebalType,
    skillType,
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

const get_options_dict = {
  labels: (action, dispatch) => {
    client.query({
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          labels (nameLike: $nameLike) {
            id
            name
            level
          }
        }
      `,
      variables: { nameLike: action.value },
    }).then(response => {
      let options = response.data.labels
        .filter(x => x.level === 1)
        .map(x => ({value: x.id, text: x.name}))
      dispatch({
        ...action,
        type: FIELD_SEARCH_FINISHED,
        options,
      })
    })
  },
  subLabels: (action, dispatch) => {
    client.query({
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          labels (nameLike: $nameLike) {
            id
            name
            level
          }
        }
      `,
      variables: { nameLike: action.value },
    }).then(response => {
      let options = response.data.labels
        .filter(x => x.level === 1)
        .map(x => ({value: x.id, text: x.name}))
      dispatch({
        ...action,
        type: FIELD_SEARCH_FINISHED,
        options,
      })
    })
  },
  titles: (action, dispatch) => {
    client.query({
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          users (nameLike: $nameLike) {
            id
            username 
            type
          }
        }
      `,
      variables: { nameLike: action.value },
    }).then(response => {
      let options = response.data.labels
        .filter(x => x.level === 1)
        .map(x => ({value: x.id, text: x.name}))
      dispatch({
        ...action,
        type: FIELD_SEARCH_FINISHED,
        options,
      })
    })
  },
}


const labels_query_params = (value) => {
  return !!value
  ? {
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          labels (nameLike: $nameLike) {
            id name level skillType labelType parent {id}
          }
        }
      `,
      variables: { nameLike: value },
    }
  : {
      query: gql`
        query OptionsQuery {
          labels {
            id name level skillType labelType parent {id}
          }
        }
      `,
    }
}
const SEARCH_CONF = {
  titles: {
    title_course: {
      query_params: (value) => ({
        query: gql`
          query CoursesQuery {
            courses {
              id name nameZh unitNum
            }
          }
        `,
        variables: { nameLike: value },
      }),
      options_builder: (response, value, fieldList) => response.data.courses
        .map(x => ({value: x.id, text: x.nameZh, unitNum: x.unitNum}))
        .filter(x => value ? x.text.indexOf(value) !== -1: true)
    },
    unit_id: {
      query_params: (value) => ({
        query: gql`
          query CoursesQuery{
            courses{
              id name nameZh unitNum
            }
          }
        `,
        variables: { nameZhLike: value },
      }),
      options_builder: (response, value, fieldList) => {
        let selected_course_ids = fieldList.find(x => x.dataIndex === 'title_course').value.map(x => x.key);
        let courses = response.data.courses
          .filter(x => selected_course_ids.indexOf(x.id) !== -1)

        let options = [].concat(...(courses.map(c => {
          let options = [];
          for (let i=1; i<=c.unitNum; i++) {
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
      query_params: (value) => ({
        query: gql`
          query UsersQuery {
            users {
              id token username
            }
          }
        `,
        variables: { nameLike: value },
      }),
      options_builder: (response, value, fieldList) => {
        debugger;
        return response.data.users
          .map(x => ({value: x.id, text: x.username,}))
          .filter(x => value ? x.text.indexOf(value) !== -1: true)
      }
    },
    discourse_review_user: {
      query_params: (value) => ({
        query: gql`
          query UsersQuery {
            users {
              id token username
            }
          }
        `,
        variables: { nameLike: value },
      }),
      options_builder: (response, value, fieldList) => {
        return response.data.users
          .map(x => ({value: x.id, text: x.username,}))
          .filter(x => value ? x.text.indexOf(value) !== -1: true)
      }
    },
    label_tag_user: {
      query_params: (value) => ({
        query: gql`
          query UsersQuery {
            users {
              id token username
            }
          }
        `,
        variables: { nameLike: value },
      }),
      options_builder: (response, value, fieldList) => {
        return response.data.users
          .map(x => ({value: x.id, text: x.username,}))
          .filter(x => value ? x.text.indexOf(value) !== -1: true)
      }
    },
    label_review_user: {
      query_params: (value) => ({
        query: gql`
          query UsersQuery {
            users {
              id token username
            }
          }
        `,
        variables: { nameLike: value },
      }),
      options_builder: (response, value, fieldList) => {
        return response.data.users
          .map(x => ({value: x.id, text: x.username,}))
          .filter(x => value ? x.text.indexOf(value) !== -1: true)
      }
    },
    skill_level_1: {
      query_params: labels_query_params,
      options_builder: (response, value, fieldList) => {
        return response.data.labels
          .filter(x => x.level === 1 && x.labelType === 'WJN')
          .map(x => ({value: x.id, text: x.name}))
      }
    },
    skill_level_2: {
      query_params: labels_query_params,
      options_builder: (response, value, fieldList) => {
        return response.data.labels
          .filter(x => x.level === 2 && x.labelType === 'WJN')
          .map(x => ({value: x.id, text: x.name, parentId: x.parent && x.parent.id}))
          .filter(x => {
            let skill_level_1 = fieldList.find(x => x.dataIndex === 'skill_level_1')
            return skill_level_1.value ? skill_level_1.value.find(y => y.key === x.parentId) : true
          })
      }
    },
    content_level_1: {
      query_params: labels_query_params,
      options_builder: (response) => {
        return response.data.labels
          .filter(x => x.level === 1 && x.labelType === 'NRKJ')
          .map(x => ({value: x.id, text: x.name}))
      }
    },
    content_level_2: {
      query_params: labels_query_params,
      options_builder: (response, value, fieldList) => {
        return response.data.labels
          .filter(x => x.level === 2 && x.labelType === 'NRKJ')
          .map(x => ({value: x.id, text: x.name, parentId: x.parent && x.parent.id}))
          .filter(x => {
            let content_level_1= fieldList.find(x => x.dataIndex === 'content_level_1')
            return content_level_1.value ? content_level_1.value.find(y => y.key === x.parentId) : true
          })
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
    // client.query({
    //   query: gql`
    //     query OptionsQuery ($nameLike: String!) {
    //       labels (nameLike: $nameLike) {
    //         id name level
    //       }
    //     }
    //   `,
    //   variables: { nameLike: value },
    // }).then(response => {
    //   let options = response.data.labels
    //     .filter(x => x.level === 1)
    //     .map(x => ({value: x.id, text: x.name}))
    //   dispatch({
    //     ...action,
    //     type: FIELD_SEARCH_FINISHED,
    //     options,
    //   })
    // })
  }
}

export const on_change_of_field = (listName, dataIndex, fieldList) => (dispatch, getState) => {
  return value => {
    console.log('on_change_of_field', fieldList, listName, dataIndex, value)
    dispatch({
      type: FIELD_ON_CHANGE,
      listName,
      dataIndex,
      value,
      //options: [],
    })
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
