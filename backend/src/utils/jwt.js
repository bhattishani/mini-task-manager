const jwt = require('jsonwebtoken')
const { jwt: jwtConfig } = require('../config/env')

/**
 * Signs a JWT token.
 * @param {object} payload - The payload to include in the token (e.g., user id, email).
 * @returns {string} The generated JWT.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  })
}

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT to verify.
 * @returns {object} The decoded payload.
 */
const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret)
}

module.exports = { generateToken, verifyToken }
