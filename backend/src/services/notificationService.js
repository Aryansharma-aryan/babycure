const Notification = require('../models/Notification')
const User = require('../models/User')
const { getLogoAttachment, getLogoHtml, sendEmail } = require('./emailService')

const createNotification = async ({ user, type, title, message, metadata = {}, email }) => {
  const notification = await Notification.create({
    user,
    type,
    title,
    message,
    metadata,
  })

  if (email?.to) {
    const html = email.html || `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17324D;padding:20px;background:#F7FCFF">
        <div style="max-width:640px;margin:auto;background:#FFFFFF;border:1px solid #DCEFF8;border-radius:14px;padding:22px">
          ${getLogoHtml()}
          <h2 style="color:#17324D;margin:0 0 12px">${email.subject || title}</h2>
          <p style="font-size:15px;color:#475569;margin:0 0 16px">${message}</p>
          <p style="margin-top:24px;color:#64748B;font-size:13px">Team BabyCure</p>
        </div>
      </div>
    `
    await sendEmail({
      to: email.to,
      subject: email.subject || title,
      text: email.text || message,
      html,
      attachments: [...getLogoAttachment(), ...(email.attachments || [])],
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
