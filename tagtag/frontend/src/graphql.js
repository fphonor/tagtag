import { ApolloClient } from 'apollo-client'
import { AUTH_TOKEN } from './constant'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-client-preset'
import { InMemoryCache } from 'apollo-cache-inmemory'

const httpLink = new HttpLink({uri: '/graphql/'})

const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  const authorizationHeader = token ? `Bearer ${token}` : null
  operation.setContext({
    headers: {
      Authorization: authorizationHeader
    }
  })
  return forward(operation)
})

export const client = new ApolloClient({
  link: middlewareAuthLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
})
