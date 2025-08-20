const express = require('express')
const { register, login, upload, me } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/signup', upload.single('profileImage'), register)
router.post('/login', login)

router.use(protect)
router.get('/me', me)

module.exports = router
