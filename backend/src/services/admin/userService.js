const User = require('../../models/User')
const { deleteAllTasksByUserId } = require('./taskService')

/**
 * Creates a new user (admin only).
 * @param {object} userData - The data for the new user.
 * @param {string} userData.name - The name of the user.
 * @param {string} userData.email - The email of the user.
 * @param {string} userData.password - The password of the user.
 * @param {string} userData.role - The role of the user (e.g., admin, user).
 * @returns {Promise<object>} The created user.
 */
const createUser = async (userData) => {
  const { name, email, password, role } = userData

  const user = await User.create({
    name,
    email,
    password,
    role,
  })

  // Do not return the password
  user.password = undefined
  return user
}

/**
 * Get paginated list of users
 * @param {Object} options Pagination and filter options
 * @param {number} options.page - The page number for pagination.
 * @param {number} options.pageSize - The number of users to return per page.
 * @param {string} options.sortField - The field to sort by.
 * @param {string} options.sortOrder - The order to sort (asc or desc).
 * @returns {Promise<{users: Array, total: number}>}
 */
const getUsers = async (options = {}) => {
  const { page = 0, pageSize = 10, sortField = 'createdAt', sortOrder = 'desc' } = options

  const query = {}

  const skip = page * pageSize

  const total = await User.countDocuments(query)

  const users = await User.find(query)
    .sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(pageSize)
    .select('-password')

  return {
    users,
    total,
  }
}

/**
 * Updates an existing user.
 * @param {string} userId - The ID of the user to update.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object|null>} The updated user or null if not found.
 */
const updateUser = async (userId, updateData) => {
  // Ensure password cannot be updated through this generic route
  const { password, ...safeUpdateData } = updateData

  const user = await User.findByIdAndUpdate(userId, safeUpdateData, {
    new: false,
    runValidators: true,
  }).select('-password')

  return user
}

/**
 * Deletes a user.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<object|null>} The deleted user or null if not found.
 */
const deleteUser = async (userId) => {
  await deleteAllTasksByUserId(userId)
  await User.findByIdAndDelete(userId)
  return null // Return null to indicate successful deletion  
}

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
}
