const Notification = require('../models/Notification')
const User = require('../models/User')
const { sendEmail } = require('./emailService')

const createNotification = async ({ user, type, title, message, metadata = {}, email }) => {
  const notification = await Notification.create({
    user,
    type,
    title,
    message,
    metadata,
  })

  if (email?.to) {
    await sendEmail({
      to: email.to,
      subject: email.subject || title,
      text: email.text || message,
      html: email.html,
    })
  }

  return notification
}

const notifyUser = async ({ userId, type, title, message, metadata }) => {
  const user = await User.findById(userId).select('email name phone')

  return createNotification({
    user: userId,
    type,
    title,
    message,
    metadata,
    email: user?.email
      ? {
          to: user.email,
          subject: title,
          text: message,
        }
      : undefined,
  })
}

module.exports = {
  createNotification,
  notifyUser,
}
