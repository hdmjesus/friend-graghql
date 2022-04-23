import Person from '../../models/person.js'
import User from '../../models/user.js'
import jwt from 'jsonwebtoken'
export const resolvers = {
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
    },
    direction: root => {
      return {
        directionName: `${root.street}, ${root.city}`
      }
    }
  }
}
