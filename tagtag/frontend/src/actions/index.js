import {
  ADD_LABEL,
  MODIFY_LABEL,
  DELETE_LABEL,
  FETCH_TITLES,
  FETCH_QUESTIONS,
  MODIFY_QUESTIONS,
  FETCH_DISCOURSE,
  MODIFY_DISCOURSE,
  FETCH_TITLE,
  MODIFY_TITLE,
  UPDATE_SFFs,
  FIELD_ON_SEARCH,
  FIELD_ON_CHANGE,
  FIELD_SEARCH_FINISHED,
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

export const modifyLabel = label => (dispatch, getState) => {
  if (label.id === null) {
    label.id = 99999;
  }
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

export const addSearchFormFields = fields => (dispatch, getState) => ({
  type: UPDATE_SFFs,
  searchFormFields: getState().searchFormFields.concat(fields),
})

export const updateSearchFormFields = fields => (dispatch, getState) => ({
  type: UPDATE_SFFs,
  searchFormFields: getState().searchFormFields.concat(fields),
})

const get_options_dict = {
  labels: (action, dispatch) => {
    client.query({
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          labels (labelNameLike: $nameLike) {
            id
            labelName
            labelLevel
          }
        }
      `,
      variables: { nameLike: action.value },
    }).then(response => {
      let options = response.data.labels
        .filter(x => x.labelLevel === 1)
        .map(x => ({value: x.id, text: x.labelName}))
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
          labels (labelNameLike: $nameLike) {
            id
            labelName
            labelLevel
          }
        }
      `,
      variables: { nameLike: action.value },
    }).then(response => {
      let options = response.data.labels
        .filter(x => x.labelLevel === 1)
        .map(x => ({value: x.id, text: x.labelName}))
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
          users (labelNameLike: $nameLike) {
            id
            username 
            type
          }
        }
      `,
      variables: { nameLike: action.value },
    }).then(response => {
      let options = response.data.labels
        .filter(x => x.labelLevel === 1)
        .map(x => ({value: x.id, text: x.labelName}))
      dispatch({
        ...action,
        type: FIELD_SEARCH_FINISHED,
        options,
      })
    })
  },
}

export const on_search_of_field = (listName, dataIndex) => (dispatch, getState) => {
  return value => {
    console.log('on_search_of_field', listName, dataIndex, value)
    if (!value) return
    let action = {
      type: FIELD_ON_SEARCH,
      listName,
      dataIndex,
      value,
    }
    dispatch(action)
    client.query({
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          labels (labelNameLike: $nameLike) {
            id labelName labelLevel
          }
        }
      `,
      variables: { nameLike: value },
    }).then(response => {
      let options = response.data.labels
        .filter(x => x.labelLevel === 1)
        .map(x => ({value: x.id, text: x.labelName}))
      dispatch({
        ...action,
        type: FIELD_SEARCH_FINISHED,
        options,
      })
    })
  }
}

export const on_change_of_field = (listName, dataIndex) => (dispatch, getState) => {
  return value => {
    debugger;
    console.log('on_change_of_field', listName, dataIndex, value)
    dispatch({
      type: FIELD_ON_CHANGE,
      listName,
      dataIndex,
      value,
      options: []
    })
  }
}
