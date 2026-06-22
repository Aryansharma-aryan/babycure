const Notification = require('../models/Notification')
const asyncHandler = require('../utils/asyncHandler')

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  })
})

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true },
  )

  res.status(200).json({
    success: true,
    notification,
  })
})

module.exports = {
  getMyNotifications,
  markNotificationRead,
}
