const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

async function check(result, expectedStatus, environment = 'development') {
  const deleted = []
  let response
  class AppError extends Error {
    constructor(message, statusCode) { super(message); this.statusCode = statusCode }
  }
  const dependencies = {
    bcryptjs: { hash: async () => 'hash' },
    crypto: { randomInt: () => 123456 },
    '../models/Otp': {
      deleteMany: async () => {},
      create: async () => ({ _id: 'new-otp' }),
      deleteOne: async (filter) => deleted.push(filter),
    },
    '../models/User': { findOne: async () => ({ name: 'Test' }) },
    '../utils/AppError': AppError,
    '../utils/asyncHandler': (handler) => handler,
    '../utils/jwt': {},
    '../utils/phone': {},
    '../services/notificationService': {},
    '../config/logger': { error: () => {} },
    '../services/emailService': {
      getLogoHtml: () => '', getLogoAttachment: () => [],
      sendEmail: async () => { if (result instanceof Error) throw result; return result },
    },
  }
  const context = { require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`)
    return dependencies[name]
  }, module: { exports: {} }, process: { env: { NODE_ENV: environment } } }
  vm.runInNewContext(fs.readFileSync('src/controllers/authController.js', 'utf8'), context)
  const res = { status: (status) => ({ json: (body) => { response = { status, body } } }) }
  if (expectedStatus === 200) {
    await context.module.exports.sendPasswordResetOtp({ body: { email: 'test@example.com' } }, res)
    assert.equal(response.status, 200)
    assert.equal(response.body.devOtp, undefined)
    assert.equal(deleted.length, 0)
  } else {
    await assert.rejects(context.module.exports.sendPasswordResetOtp({ body: { email: 'test@example.com' } }, res), (error) => error.statusCode === expectedStatus)
    assert.equal(response, undefined)
    assert.equal(deleted.length, 1)
    assert.equal(deleted[0]._id, 'new-otp')
  }
}
;(async () => {
  for (const environment of ['development', 'production']) {
    await check({ skipped: true }, 503, environment)
    await check(Object.assign(new Error('Authentication failed'), { code: 'EAUTH' }), 502, environment)
    await check({ accepted: ['test@example.com'] }, 200, environment)
  }
  console.log('Passed: SMTP missing, authentication failure, and successful send in development and production')
})().catch((error) => { console.error(error); process.exitCode = 1 })
