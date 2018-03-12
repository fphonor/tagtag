import React from 'react'
import ReactDOM from 'react-dom'

import { BrowserRouter } from 'react-router-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import { ApolloProvider } from 'react-apollo'

import './index.css'
import App from './component/App'
import reducerOfApp from './reducer'


import { client } from './graphql'


const middleware = [ thunk ];

let store = createStore(reducerOfApp, applyMiddleware(...middleware))

ReactDOM.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </Provider>,
  document.getElementById('root'))
