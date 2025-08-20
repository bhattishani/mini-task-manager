const { getDashboardStats } = require('../../services/admin/dashboardService')
const { sendError, sendSuccess } = require('../../utils/responseHandler')

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard
 * @access Private (Admin only)
 */
const getDashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats()

    sendSuccess(res, 200, stats)
  } catch (error) {
    sendError(res, 500, 'Error fetching dashboard statistics', error)
  }
}

module.exports = {
  getDashboard,
}
