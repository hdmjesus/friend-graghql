import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import express from 'express'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import dotenv from 'dotenv'

import schema from './src/graphql/schemas/schema.js'
import './db.js'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
const PORT = process.env.PORT

async function startApolloServer (typeDefinitions, resolvers) {
  const app = express()
  app.use(cors())

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],

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

  await server.start()
  server.applyMiddleware({ app })

  app.listen(PORT || 3000, function () {
    console.log(
      `Express server listening on port ${process.env.PORT} mode'`,
      this.address().port,
      app.settings.env
    )
  })
}

startApolloServer()
