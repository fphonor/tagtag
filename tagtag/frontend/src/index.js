import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import App from './component/App'
import registerServiceWorker from './registerServiceWorker'

import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reducerOfApp from './reducer'

import { ApolloProvider } from 'react-apollo'
import { client } from './graphql'

import { BrowserRouter } from 'react-router-dom'


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
registerServiceWorker()
