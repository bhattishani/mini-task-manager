const app = require('./app')
const { port } = require('./config/env')
const { connectDB } = require('./config/db')
const { setupMongoDB } = require('./utils/dbSetup')
const User = require('./models/User')

const startServer = async () => {
  try {
    // Set up MongoDB users first
    await setupMongoDB()

    // Connect to all database shards
    await connectDB()

    // create admin if not exists
    const admin = await User.findOne({ role: 'admin' })
    if (!admin) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: '123456',
        role: 'admin',
      })
    }

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
