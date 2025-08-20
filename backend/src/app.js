const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const dotenv = require('dotenv')
const { errorHandler } = require('./middleware/errorMiddleware')
const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/admin/adminRoutes')

// Load environment variables
dotenv.config()

const app = express()

// --- Core Middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

// Set various HTTP headers for security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
  })
)

// Parse JSON bodies
app.use(express.json())
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }))

// --- Serve Static Files ---
// Make the 'uploads' directory publicly accessible
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin')
    res.set('Access-Control-Allow-Origin', process.env.CLIENT_URL)
  }
}))

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('API is running...')
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)

app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => res.send('API is running'))

// --- Error Handling Middleware ---
// This should be the last middleware
app.use(errorHandler)

module.exports = app
