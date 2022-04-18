import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI =
  'mongodb+srv://hdmjesus:thypi123.@hdjesus.edtuq.mongodb.net/miPrimeraDataBase?retryWrites=true&w=majority'

mongoose
  .connect(MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true
  })
  .then(() => {
    console.log('conected to mongodb')
  })
  .catch(error => {
    console.error('error to conection to Mongodb', error.message)
  })
