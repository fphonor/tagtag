import { combineReducers } from 'redux'
import {
  ADD_LABEL,
  MODIFY_LABEL,
  DELETE_LABEL,
  FETCH_TITLES,
  FETCH_TITLE,
  MODIFY_TITLE,
} from '../constant/ActionType'

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
          ? {...x, id: label.id, labelName: label.labelName}
          : x
      )
    case DELETE_LABEL:
      return state.filter(x => x.key !== action.label.key)
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

export default combineReducers({
  labels,
  titles,
	currentTitle,
  searchFormFields 
})
