const nodemailer = require('nodemailer')

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      // Google displays app passwords in groups separated by spaces.
      pass: process.env.SMTP_HOST.trim().toLowerCase() === 'smtp.gmail.com'
        ? process.env.SMTP_PASS.replace(/\s/g, '')
        : process.env.SMTP_PASS,
    },
  })
}

module.exports = {
  getTransporter,
}
