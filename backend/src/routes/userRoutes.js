const express = require('express')
const { updateProfile, upload } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(protect)

router.put('/profile', upload.single('profileImage'), updateProfile)

module.exports = router
