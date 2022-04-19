import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

mongoose
  .connect(process.env.MONGODB_URI, {
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
