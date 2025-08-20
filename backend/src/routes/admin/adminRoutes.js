const express = require('express')
const taskRoutes = require('./taskRoutes')
const userRoutes = require('./userRoutes')
const { getDashboard } = require('../../controllers/admin/dashboardController')
const { protect, admin } = require('../../middleware/authMiddleware')

const router = express.Router()

router.use(protect, admin)

router.get('/dashboard', getDashboard)
router.use('/tasks', taskRoutes)
router.use('/users', userRoutes)

module.exports = router
