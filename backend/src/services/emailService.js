const { getTransporter } = require('../config/email')
const logger = require('../config/logger')

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      logger.info({ to, subject, text }, 'Email skipped because SMTP is not configured')
    }
    return { skipped: true }
  }

  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  })
}

module.exports = {
  sendEmail,
}
