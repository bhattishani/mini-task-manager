const { sendError } = require('../utils/responseHandler')
const { nodeEnv } = require('../config/env')

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  // Log the error for debugging purposes
  console.error(err.stack)

  sendError(res, statusCode, err.message, nodeEnv === 'production' ? null : err.stack)
}

module.exports = { errorHandler }
