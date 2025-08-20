const express = require('express')
const { createUser, getUsers, updateUser, deleteUser, deleteMultipleUsers } = require('../../controllers/admin/userController')
const router = express.Router()

router.route('/').get(getUsers).post(createUser).delete(deleteMultipleUsers)
router.route('/:id').put(updateUser).delete(deleteUser)

module.exports = router
