const express = require('express')
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  deleteMultipleTasks,
} = require('../controllers/taskController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(protect)

router.route('/').get(getTasks).post(createTask)
router.route('/:id').put(updateTask).delete(deleteTask)
router.route('/delete-multiple').post(deleteMultipleTasks)

module.exports = router
