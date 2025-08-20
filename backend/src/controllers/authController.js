const authService = require('../services/authService')
const { sendSuccess, sendError } = require('../utils/responseHandler')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// --- Multer Configuration for Profile Image Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/profiles')
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes))
  },
})

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    if (password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match')
    }

    // The path where the image is stored, relative to a public serving directory
    const profileImagePath = req.file ? req.file.filename : null

    const result = await authService.registerUser({ name, email, password }, profileImagePath)
    sendSuccess(res, 201, result)
  } catch (error) {
    // If there's an error and a file was uploaded, delete it.
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    sendError(res, 400, error.message)
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await authService.loginUser(email, password)
    sendSuccess(res, 200, result)
  } catch (error) {
    sendError(res, 401, error.message)
  }
}
const me = async (req, res) => {
  try {
    console.log(req.user)

    const result = await authService.me(req.user._id)
    sendSuccess(res, 200, result)
  } catch (error) {
    sendError(res, 401, error.message)
  }
}

module.exports = {
  register,
  login,
  upload,
  me,
}
