/**
 * Sends a standardized success response.
 * @param {object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {object} data - The payload to send.
 */
const sendSuccess = (res, statusCode, data) => {
  res.status(statusCode).json({
    success: true,
    data,
  })
}

/**
 * Sends a standardized error response.
 * @param {object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - The error message.
 * @param {string} [stack] - Optional error stack for development mode.
 */
const sendError = (res, statusCode, message, stack = null) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(stack && { stack }),
    },
  })
}

module.exports = { sendSuccess, sendError }
