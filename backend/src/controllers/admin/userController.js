const userService = require('../../services/admin/userService')
const { sendSuccess, sendError } = require('../../utils/responseHandler')

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body)
    sendSuccess(res, 201, user)
  } catch (error) {
    sendError(res, 400, error.message)
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers()
    sendSuccess(res, 200, users)
  } catch (error) {
    sendError(res, 500, error.message)
  }
}

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body)
    if (!user) {
      return sendError(res, 404, 'User not found')
    }
    sendSuccess(res, 200, user)
  } catch (error) {
    sendError(res, 400, error.message)
  }
}

const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id)
    if (!user) {
      return sendError(res, 404, 'User not found')
    }
    sendSuccess(res, 200, { message: 'User deleted successfully' })
  } catch (error) {
    sendError(res, 500, error.message)
  }
}


const deleteMultipleUsers = async (req, res) => {
  try {
    const { userIds } = req.body
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return sendError(res, 400, 'Invalid user IDs')
    }

    if (Array.isArray(userIds) && userIds.includes(req.user.id) && userIds.length === 1) {
      return sendError(res, 400, 'Cannot delete the currently logged-in user')
    }

    const deletedUsers = await Promise.all(
      userIds.map((id) => req.user.id !== id && userService.deleteUser(id))
    )

    sendSuccess(res, 200, { message: 'Users deleted successfully', deletedUsers })
  } catch (error) {
    sendError(res, 500, error.message)
  }
}

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  deleteMultipleUsers
}
