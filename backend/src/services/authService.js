const User = require('../models/User')
const { generateToken } = require('../utils/jwt')
const { security } = require('../config/env')

/**
 * Registers a new user.
 * @param {object} userData - User data (name, email, password).
 * @param {string} profileImagePath - The path to the uploaded profile image.
 * @returns {Promise<object>} The created user and token.
 */
const registerUser = async (userData, profileImagePath) => {
  const { name, email, password } = userData

  // Check if email already exists
  const existingUser = await User.findOne({ email }).lean()
  if (existingUser) {
    throw new Error('Email is already in use.')
  }

  const user = await User.create({
    name,
    email,
    password,
    profileImage: profileImagePath,
  })

  const token = generateToken({ id: user._id, email: user.email })

  return {
    user,
    token,
  }
}

/**
 * Logs in a user.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} The logged-in user and token.
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('Invalid credentials.')
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new Error('Account locked. Try again later.')
  }

  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    // Increment login attempts and lock account if necessary
    user.loginAttempts += 1
    if (user.loginAttempts >= security.maxLoginAttempts) {
      user.lockUntil = Date.now() + security.lockTime
    }
    await user.save()
    throw new Error('Invalid credentials.')
  }

  // Reset login attempts on successful login
  user.loginAttempts = 0
  user.lockUntil = null
  await user.save()

  const token = generateToken({ id: user._id, email: user.email })

  return {
    user,
    token,
  }
}

const me = async (userId) => {
  const user = await User.findById(userId).select('-password')
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

module.exports = {
  registerUser,
  loginUser,
  me,
}
