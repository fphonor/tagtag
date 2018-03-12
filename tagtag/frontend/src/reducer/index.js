import { combineReducers } from 'redux'
import {
  ADD_LABEL,
  INIT_LABELS,
  MODIFY_LABEL,
  DELETE_LABEL,
  FETCH_TITLES,
  FETCH_TITLE,
  MODIFY_TITLE,
  CLEAR_CURRENT_USER,
  SET_CURRENT_USER,
  UPDATE_DEFAULT_LABEL_SEARCH_FIELDS,
} from '../constant/ActionType'
import { CURRENT_USER, AUTH_TOKEN } from '../constant'

import searchFormFields from './SearchFormFields'

const labels = (state = [], action) => {
  switch (action.type) {
    case ADD_LABEL:
      return [
        ...state,
        action.label
      ]
    case MODIFY_LABEL:
      let label = action.label
      return state.map(x =>
        (x.key === label.key) 
          ? {...x, id: label.id, label_name: label.label_name}
          : x
      )
    case DELETE_LABEL:
      return state.filter(x => x.key !== action.label.key)
    case INIT_LABELS:
      return action.labels
    default:
      return state
  }
}

const titles = (state = [], action) => {
  switch (action.type) {
    case FETCH_TITLES:
      return action.titles
    default:
      return state
  }
}

const questions = (state = [], action) => {
  switch (action.type) {
    case 'FETCH_QUESTIONS':
    case 'MODIFY_QUESTIONS':
      return action.questions
    default:
      return state
  }
}

const discourse = (state = {}, action) => {
  switch (action.type) {
    case 'FETCH_DISCOURSE':
    case 'MODIFY_DISCOURSE':
      return action.discourse
    default:
      return state
  }
}

const currentTitle = (state = {}, action) => {
  switch (action.type) {
    case FETCH_TITLE:
    case MODIFY_TITLE:
      return action.currentTitle
    default:
      return {
        questions: questions(state.questions, action),
        discourse: discourse(state.discourse, action),
			}
  }
}

const currentUser = (state=JSON.parse(localStorage.getItem(CURRENT_USER)) || {}, action) => {
  switch (action.type) {
    case SET_CURRENT_USER:
      if (action.jwt_token) {
        localStorage.setItem(AUTH_TOKEN, action.jwt_token)
      }
      localStorage.setItem(CURRENT_USER, JSON.stringify(action.currentUser))
      return {...state, ...action.currentUser}
    case CLEAR_CURRENT_USER:
      localStorage.removeItem(AUTH_TOKEN)
      localStorage.removeItem(CURRENT_USER)
      return {}
    default:
      let jwt_token = localStorage.getItem(AUTH_TOKEN)
      return jwt_token ? state : {}
  }
}

const defaultLabelSearchFields = (state={
    label_level: 1,
    label_type: "WJN",
    label_name: "",
    parent_id: null,
    skill_type: 'TL',
  }, action) => {
  switch (action.type) {
    case UPDATE_DEFAULT_LABEL_SEARCH_FIELDS:
      return {...state, ...action.label_earch_fields}
    default:
      return state
  }
}

export default combineReducers({
  labels,
  titles,
	currentTitle,
  currentUser,
  searchFormFields,
  defaultLabelSearchFields
})
