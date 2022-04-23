import { gql } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import { resolvers } from '../revolvers/resolvers.js'

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }
  type Address {
    city: String!
    street: String!
  }
  type Direction {
    directionName: String!
  }

  type Person {
    name: String!
    age: Int!
    address: Address!
    direction: Direction!
    phone: String
    id: ID!
  }
  type User {
    username: String!
    friends: [Person]
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    personsCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    editNumber(name: String!, phone: String!): Person

    createUser(username: String!): User

    login(username: String!, password: String!): Token

    addAsFriend(name: String!): User
  }
`

export default makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers
})
