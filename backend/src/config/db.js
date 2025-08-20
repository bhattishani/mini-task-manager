const mongoose = require('mongoose')
const { mongoUri } = require('./env')

/**
 * Initializes the MongoDB connection.
 */
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err))
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'))

module.exports = { connectDB }
