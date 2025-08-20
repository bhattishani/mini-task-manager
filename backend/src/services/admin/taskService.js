const Task = require('../../models/Task')

/**
 * Creates a new task for a user.
 * @param {object} taskData - The data for the new task.
 * @returns {Promise<object>} The created task.
 */
const createTask = async (taskData) => {
  const { title, description, status, userId } = taskData

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
 * @param {object} filters - The filter criteria.
 * @param {string} filters.status - The task status ('pending' or 'completed').
 * @param {string} filters.search - The search term for the task title and description.
 * @param {string} filters.date - The ISO date string to filter by creation date.
 * @param {string} filters.userId - The ID of the user.
 * @param {number} filters.page - The page number for pagination.
 * @param {number} filters.pageSize - The number of tasks to return per page.
 * @param {string} filters.sortField - The field to sort by.
 * @param {string} filters.sortOrder - The order to sort (asc or desc).
 * @returns {Promise<Array>} A list of tasks.
 */
const getTasksByUserId = async (filters = {}) => {
  const {
    status,
    search,
    startDate,
    endDate,
    userId,
    page = 0,
    pageSize = 10,
    sortField = 'createdAt',
    sortOrder = 'desc',
  } = filters

  const query = {}

  if (userId) {
    query.userId = userId
  }

  if (status && status !== 'all') {
    query.status = status
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

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = page * pageSize

  const total = await Task.countDocuments(query)

  const tasks = await Task.find(query)
    .sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(pageSize)

  return {
    tasks,
    total,
  }
}

/**
 * Updates an existing task.
 * @param {string} taskId - The ID of the task to update.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object|null>} The updated task or null if not found/authorized.
 */
const updateTask = async (taskId, updateData) => {
  const task = await Task.findOne({ _id: taskId })

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
 * @returns {Promise<object|null>} The deleted task or null if not found/authorized.
 */
const deleteTask = async (taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId })
  return task
}

/**
 * Deletes all tasks for a specific user.
 * @param {string} userId - The ID of the user whose tasks to delete.
 */
const deleteAllTasksByUserId = async (userId) => {
  await Task.deleteMany({ userId })
}

module.exports = {
  createTask,
  getTasksByUserId,
  updateTask,
  deleteTask,
  deleteAllTasksByUserId,
}
