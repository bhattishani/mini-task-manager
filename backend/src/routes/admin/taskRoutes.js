const express = require('express')
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  deleteMultipleTasks,
} = require('../../controllers/admin/taskController')

const router = express.Router()

router.route('/').get(getTasks).post(createTask)

router.route('/:id').put(updateTask).delete(deleteTask)

router.route('/delete-multiple').post(deleteMultipleTasks)

module.exports = router
