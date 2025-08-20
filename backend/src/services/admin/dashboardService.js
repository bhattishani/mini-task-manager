const Task = require('../../models/Task')
const User = require('../../models/User')

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments()
  const totalTasks = await Task.countDocuments()
  const completedTasks = await Task.countDocuments({ status: 'completed' })
  const pendingTasks = await Task.countDocuments({ status: 'pending' })

  // Get tasks created in the last 7 days
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)

  const tasksByDay = await Task.aggregate([
    {
      $match: {
        createdAt: { $gte: last7Days },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ])

  // Get tasks by status distribution
  const tasksByStatus = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  // Get user registrations over time
  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: last7Days },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ])

  return {
    overview: {
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
    },
    charts: {
      tasksByDay,
      tasksByStatus,
      userRegistrations,
    },
  }
}

module.exports = {
  getDashboardStats,
}
