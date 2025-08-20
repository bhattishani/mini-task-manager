const User = require('../models/User')
const { sendError } = require('../utils/responseHandler')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/profiles'
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)

        if (extname && mimetype) {
            return cb(null, true)
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'))
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
})

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found'
                }
            })
        }

        if (req.body.name) user.name = req.body.name
        if (req.body.email) user.email = req.body.email

        if (req.body.currentPassword && req.body.newPassword) {
            const isMatch = await user.comparePassword(req.body.currentPassword)
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Current password is incorrect'
                    }
                })
            }
            user.password = req.body.newPassword
        }

        if (req.file) {
            if (user.profileImage) {
                const oldImagePath = path.join('uploads/profiles', user.profileImage)
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath)
                }
            }
            user.profileImage = req.file.filename
        }

        await user.save()

        const userResponse = { ...user.toObject() }
        delete userResponse.password

        res.json({
            success: true,
            data: userResponse
        })
    } catch (error) {
        sendError(res, 500, error.message)
    }
}

exports.upload = upload