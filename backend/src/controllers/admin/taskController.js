const taskService = require('../../services/admin/taskService')
const { sendSuccess, sendError } = require('../../utils/responseHandler')

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body)
    sendSuccess(res, 201, task)
  } catch (error) {
    sendError(res, 400, error.message)
  }
}

const getTasks = async (req, res) => {
  try {
    const tasks = await taskService.getTasksByUserId(req.query)
    sendSuccess(res, 200, tasks)
  } catch (error) {
    sendError(res, 500, error.message)
  }
}

const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body)
    if (!task) {
      return sendError(res, 404, 'Task not found or user not authorized')
    }
    sendSuccess(res, 200, task)
  } catch (error) {
    sendError(res, 400, error.message)
  }
}

const deleteTask = async (req, res) => {
  try {
    const task = await taskService.deleteTask(req.params.id)
    if (!task) {
      return sendError(res, 404, 'Task not found or user not authorized')
    }
    sendSuccess(res, 200, { message: 'Task deleted successfully' })
  } catch (error) {
    sendError(res, 500, error.message)
  }
}

const deleteMultipleTasks = async (req, res) => {
  try {
    const { taskIds } = req.body
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return sendError(res, 400, 'Invalid task IDs')
    }

    const deletedTasks = await Promise.all(
      taskIds.map((id) => taskService.deleteTask(id))
    )

    sendSuccess(res, 200, { message: 'Tasks deleted successfully', deletedTasks })
  } catch (error) {
    sendError(res, 500, error.message)
  }
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  deleteMultipleTasks,
}
