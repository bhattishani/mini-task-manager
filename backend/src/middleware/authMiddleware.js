const { verifyToken } = require('../utils/jwt')
const User = require('../models/User')
const { sendError } = require('../utils/responseHandler')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = verifyToken(token)

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        return sendError(res, 401, 'Not authorized, user not found')
      }

      next()
    } catch (error) {
      console.error(error)
      return sendError(res, 401, 'Not authorized, token failed')
    }
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token')
  }
}

const admin = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = verifyToken(token)

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        return sendError(res, 401, 'Not authorized, user not found')
      }

      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return sendError(res, 403, 'Not authorized, admin access only')
      }

      next()
    } catch (error) {
      console.error(error)
      return sendError(res, 401, 'Not authorized, token failed')
    }
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized, no token')
  }
}

module.exports = { protect, admin }
