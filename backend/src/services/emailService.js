const fs = require('fs')
const path = require('path')
const { getTransporter } = require('../config/email')
const logger = require('../config/logger')

const logoPath = path.resolve(__dirname, '..', '..', '..', 'client', 'src', 'assets', 'logoBaby.png')
const logoCid = 'babycure-logo'

const getLogoAttachment = () => (fs.existsSync(logoPath)
  ? [{ filename: 'babycure-logo.png', path: logoPath, cid: logoCid, contentDisposition: 'inline' }]
  : [])

const getLogoHtml = () => (fs.existsSync(logoPath)
  ? `<img src="cid:${logoCid}" alt="BabyCure" style="width:112px;height:auto;display:block;margin:0 0 18px">`
  : '<div style="font-size:24px;font-weight:800;color:#4AA6D9;margin:0 0 18px">BabyCure</div>')

const sendEmail = async ({ to, subject, text, html, attachments }) => {
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
    attachments,
  })
}

module.exports = {
  getLogoAttachment,
  getLogoHtml,
  sendEmail,
}
