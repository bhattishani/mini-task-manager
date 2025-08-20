const Task = require('../models/Task')

/**
 * Creates a new task for a user.
 * @param {object} taskData - The data for the new task.
 * @param {string} userId - The ID of the user creating the task.
 * @param {string} taskData.title - The title of the task.
 * @param {string} taskData.description - The description of the task.
 * @param {string} taskData.status - The status of the task (e.g., pending, completed).
 * @returns {Promise<object>} The created task.
 */
const createTask = async (taskData, userId) => {
  const { title, description, status } = taskData

  const task = await Task.create({
    title,
    description,
    status,
    userId,
  })

  return task
}

/**
 * Retrieves and filters tasks for a specific user.
 * @param {string} userId - The ID of the user.
 * @param {object} filters - The filter criteria.
 * @param {string} filters.status - The task status ('pending' or 'completed').
 * @param {string} filters.search - The search term for the task title and description.
 * @param {string} filters.startDate - The start date for filtering tasks.
 * @param {string} filters.endDate - The end date for filtering tasks.
 * @returns {Promise<Array>} A list of tasks.
 */
const getTasksByUserId = async (userId, filters = {}) => {
  const { status, search, startDate, endDate } = filters

  const query = { userId }

  if (status && status !== 'all') {
    query.status = status
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) {
      query.createdAt.$gte = new Date(startDate)
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate)
    }
  }

  return Task.find(query).sort({ createdAt: -1 })
}

/**
 * Updates an existing task.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} userId - The ID of the user owning the task.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object|null>} The updated task or null if not found/authorized.
 */
const updateTask = async (taskId, userId, updateData) => {
  const task = await Task.findOne({ _id: taskId, userId })

  if (!task) {
    return null
  }

  Object.assign(task, updateData)
  await task.save()
  return task
}

/**
 * Deletes a task.
 * @param {string} taskId - The ID of the task to delete.
 * @param {string} userId - The ID of the user owning the task.
 * @returns {Promise<object|null>} The deleted task or null if not found/authorized.
 */
const deleteTask = async (taskId, userId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, userId })
  return task
}

module.exports = {
  createTask,
  getTasksByUserId,
  updateTask,
  deleteTask,
}
