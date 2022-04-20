import {
  gql,
  ApolloServer,
  UserInputError,
  AuthenticationError
} from 'apollo-server'
import dotenv from 'dotenv'

import Person from './models/person.js'
import User from './models/user.js'
import jwt from 'jsonwebtoken'
import './db.js'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
const PORT = process.env.PORT

export const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }
  type Address {
    city: String!
    street: String!
  }

  type Person {
    name: String!
    age: Int!
    address: Address!
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

const resolvers = {
  Query: {
    personsCount: () => Person.collection.countDocuments(),

    allPersons: async (root, args) => {
      if (!args.phone) return Person.find({})

      return Person.find({ phone: { $exists: args.phone === 'YES' } })
      // return personsFromApiRest.filter(person => {
      //   return args.phone == 'YES' ? person.phone : !person.phone
      // })
    },

    findPerson: (root, args) => {
      const { name } = args
      return Person.findOne({ name })

      // return persons.find(person => person.name == name)
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },

  Mutation: {
    addPerson: async (root, args, context) => {
      const { currentUser } = context
      if (!currentUser) throw new AuthenticationError('Not authenticated')

      const person = new Person({ ...args })

      try {
        await person.save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }

      return person

      // SIN UNA BASA DE DATOS EXTERNA
      // VALIDACION PARA NO AGREGAR UN USUARIO LLAMADO IGUAL
      // if (persons.find(p => p.name == args.name)) {
      //   throw new UserInputError('Name must unique', {
      //     invalidArgs: args.name
      //   })
      // }
      // const person = { ...args, id: uuid() }
      // persons.push(person)
      // return person
    },

    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })
      person.phone = args.phone

      if (!person) return

      try {
        await person.save()
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args })
      }

      return person
      // SIN UNA BASA DE DATOS EXTERNA
      // const personIndex = persons.findIndex(p => p.name === args.name)
      // if (personIndex === -1) return null
      // const person = persons[personIndex]
      // const updatePerson = { ...person, phone: args.phone }
      // persons[personIndex] = updatePerson
      // return updatePerson
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username
      })

      return user.save().catch(error => {
        throw new UserInputError(error.message, { invalidArgs: args })
      })
      // OR
      // try {
      //   await user.save()
      // } catch (error) {
      //   throw new UserInputError(error.message, { invalidArgs: args })
      // }
      // return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new UserInputError('Wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }
      return {
        value: jwt.sign(userForToken, JWT_SECRET)
      }
    },
    addAsFriend: async (root, args, context) => {
      const { currentUser } = context
      if (!currentUser) throw new AuthenticationError('Not authenticated')

      const person = await Person.findOne({ name: args.name })

      const nonFriendlyAlready = person =>
        !currentUser.friends.map(p => p._id).includes(person._id)

      if (nonFriendlyAlready(person)) {
        currentUser.friends = currentUser.friends.concat(person)

        await currentUser.save()
      }
      return { currentUser }
    }
  },

  Person: {
    address: root => {
      return {
        street: root.street,
        city: root.city
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null

    if (auth && auth.toLocaleLowerCase().startsWith('bearer')) {
      //bearer as121212121w211 <El token llega asi, con el subtring(7) lo que hacemos es dejar solo el valor del token

      const token = auth.substring(7)
      const decodeToken = jwt.verify(token, JWT_SECRET)

      const currentUser = await User.findById(decodeToken.id).populate(
        'friends'
      )
      return { currentUser }
    }
  }
})

// la propiedad context tiene un callback que se ejecutara cada vez que le llegue una request al servidor de graghql

server
  .listen()
  .then(({ url }) => {
    console.log(`server ready at : ${url}`)
  })
  .catch(err => {
    console.log(err)
  })
