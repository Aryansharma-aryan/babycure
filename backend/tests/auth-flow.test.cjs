const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const crypto = require('node:crypto')

// Exercise real controller logic without sending email or touching customer data.
function load(file, dependencies) {
  const module = { exports: {} }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), {
    module, exports: module.exports, Date, String, Set,
    require(name) { if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name); return dependencies[name] },
  }, { filename: file })
  return module.exports
}
class AppError extends Error { constructor(message, statusCode) { super(message); this.statusCode = statusCode } }
function setup() {
  const state = { record: null, user: { _id: 'user-1', email: 'parent@example.com', role: 'user' }, sessions: [], email: null, deleted: [], address: null }
  const Otp = {
    findOneAndUpdate(filter, update) {
      if (update.$inc) {
        let found = state.record
        if (!found || found.attempts >= 5 || found.expiresAt <= new Date()) found = null
        if (found) found.attempts += 1
        return { select: async () => found && { ...found } }
      }
      if (state.record && state.record.updatedAt > filter.updatedAt.$lte) return Promise.reject(Object.assign(new Error(), { code: 11000 }))
      state.record = { _id: 'otp-1', email: filter.email, ...update.$set, updatedAt: new Date() }
      return Promise.resolve(state.record)
    },
    async deleteOne(filter) {
      const match = state.record && state.record._id === filter._id && state.record.otpHash === filter.otpHash
      if (match) state.record = null
      return { deletedCount: match ? 1 : 0 }
    },
  }
  const deps = {
    bcryptjs: { hash: async (code) => 'hash:' + code, compare: async (code, hash) => hash === 'hash:' + code },
    crypto,
    '../models/Otp': Otp,
    '../models/User': { findOneAndUpdate: async () => state.user },
    '../models/Address': { findOne: () => ({ sort: async () => state.address }) },
    '../models/Session': { deleteOne: async (filter) => state.deleted.push(filter) },
    '../utils/AppError': AppError,
    '../utils/asyncHandler': (fn) => fn,
    '../utils/jwt': { AUTH_COOKIE_NAME: 'babycure_session', getCookieOptions: () => ({ httpOnly: true, maxAge: 34560000000 }) },
    '../utils/session': { createSession: async (id) => state.sessions.push(id), hashSession: (token) => crypto.createHash('sha256').update(token).digest('hex') },
    '../utils/phone': { isValidPhone: () => true, normalizePhone: (value) => value },
    '../services/notificationService': { notifyUser: async () => {} },
    '../config/logger': { error: () => {} },
    '../services/emailService': { sendEmail: async (email) => { state.email = email; if (state.failEmail) throw new Error('offline'); return { skipped: state.skipEmail } } },
  }
  const controller = load('controllers/authController.js', deps)
  const res = { statusCode: 200, cookies: [], cleared: [], status(code) { this.statusCode = code; return this }, json(body) { this.body = body; return this }, cookie(...args) { this.cookies.push(args) }, clearCookie(name) { this.cleared.push(name) } }
  const req = { body: { email: ' Parent@Example.com ' }, cookies: {}, user: state.user }
  return { state, controller, req, res, deps }
}
const codeFrom = (state) => state.email.text.match(/\b\d{6}\b/)[0]

test('email-only request normalizes email and delivers code without creating a session', async () => {
  const { state, controller, req, res } = setup()
  await controller.sendLoginOtp(req, res)
  assert.equal(state.email.to, 'parent@example.com')
  assert.match(codeFrom(state), /^\d{6}$/)
  assert.equal(state.sessions.length, 0)
  assert.equal(res.body.retryAfter, 60)
  assert.equal(JSON.stringify(res.body).includes(codeFrom(state)), false)
})
test('invalid email rejected before delivery', async () => {
  const { state, controller, req, res } = setup(); req.body.email = { value: 'bad' }
  await assert.rejects(controller.sendLoginOtp(req, res), { statusCode: 400 }); assert.equal(state.email, null)
})
test('resend cooldown prevents replacing a recent code', async () => {
  const { state, controller, req, res } = setup(); await controller.sendLoginOtp(req, res)
  const first = state.record.otpHash
  await assert.rejects(controller.sendLoginOtp(req, res), { statusCode: 429 }); assert.equal(state.record.otpHash, first)
})
test('mail failure removes unusable challenge and never logs in', async () => {
  for (const mode of ['failEmail', 'skipEmail']) {
    const { state, controller, req, res } = setup(); state[mode] = true
    await assert.rejects(controller.sendLoginOtp(req, res), { statusCode: 503 })
    assert.equal(state.record, null); assert.equal(state.sessions.length, 0)
  }
})
test('verified login supplies address details and consumes code once', async () => {
  const { state, controller, req, res } = setup(); state.address = { fullName: 'Delivery Name', phone: '9876543210' }
  await controller.sendLoginOtp(req, res); req.body.otp = codeFrom(state)
  await controller.verifyLoginOtp(req, res)
  assert.equal(res.body.user.name, 'Delivery Name'); assert.equal(res.body.user.phone, '9876543210')
  assert.equal(state.sessions.length, 1)
  await assert.rejects(controller.verifyLoginOtp(req, res), { statusCode: 400 }); assert.equal(state.sessions.length, 1)
})
test('five incorrect attempts lock the challenge even with the correct code next', async () => {
  const { state, controller, req, res } = setup(); await controller.sendLoginOtp(req, res)
  const correct = codeFrom(state); req.body.otp = '000000'
  for (let i = 0; i < 5; i++) await assert.rejects(controller.verifyLoginOtp(req, res), { statusCode: 400 })
  req.body.otp = correct; await assert.rejects(controller.verifyLoginOtp(req, res), { statusCode: 400 }); assert.equal(state.sessions.length, 0)
})
test('expired challenges cannot authenticate', async () => {
  const { state, controller, req, res } = setup(); await controller.sendLoginOtp(req, res)
  req.body.otp = codeFrom(state); state.record.expiresAt = new Date(Date.now() - 1)
  await assert.rejects(controller.verifyLoginOtp(req, res), { statusCode: 400 }); assert.equal(state.sessions.length, 0)
})
test('blocked accounts cannot start sessions after OTP verification', async () => {
  const { state, controller, req, res } = setup(); state.user.isBlocked = true
  await controller.sendLoginOtp(req, res); req.body.otp = codeFrom(state)
  await assert.rejects(controller.verifyLoginOtp(req, res), { statusCode: 403 }); assert.equal(state.sessions.length, 0)
})
test('logout revokes server session and clears both browser cookie names', async () => {
  const { state, controller, req, res } = setup(); req.cookies.babycure_session = 's_secret'
  await controller.logoutUser(req, res)
  assert.equal(state.deleted[0].tokenHash, crypto.createHash('sha256').update('s_secret').digest('hex'))
  assert.ok(res.cleared.includes('token')); assert.equal(res.cookies[0][2].maxAge, 0)
})
test('profile email cannot be changed without verification', async () => {
  const { controller, req, res } = setup(); req.body.email = 'other@example.com'
  await assert.rejects(controller.updateMe(req, res), { statusCode: 400 })
})
test('persistent middleware renews valid sessions and rejects revoked sessions', async () => {
  const { state, deps, req, res } = setup(); req.cookies.babycure_session = 's_secret'; req.headers = {}
  let valid = true; let renewals = 0
  deps['../models/Session'] = { findOneAndUpdate: async (filter, update) => { assert.ok(filter.expiresAt.$gt instanceof Date); assert.ok(update.$set.expiresAt > new Date()); renewals++; return valid ? { user: 'user-1' } : null } }
  deps['../models/User'].findById = async () => state.user
  deps['../utils/session'].sessionExpiry = () => new Date(Date.now() + 34560000000)
  const { protect } = load('middlewares/authMiddleware.js', deps)
  let passed = false; await protect(req, res, () => { passed = true })
  assert.equal(passed, true); assert.equal(renewals, 1); assert.equal(res.cookies[0][0], 'babycure_session')
  valid = false; await assert.rejects(protect(req, res, () => {}), { statusCode: 401 })
})
test('session storage holds only a hash and browser cookie is persistent and HttpOnly', async () => {
  const records = []; const cookies = []
  const { createSession } = load('utils/session.js', { crypto, '../models/Session': { create: async (record) => records.push(record) }, './jwt': { AUTH_COOKIE_NAME: 'babycure_session', getCookieOptions: () => ({ httpOnly: true, maxAge: 34560000000 }) } })
  await createSession('user-1', { cookie: (...args) => cookies.push(args) })
  assert.match(cookies[0][1], /^s_[a-f0-9]{64}$/)
  assert.equal(records[0].tokenHash, crypto.createHash('sha256').update(cookies[0][1]).digest('hex'))
  assert.equal(cookies[0][2].httpOnly, true); assert.equal(cookies[0][2].maxAge, 34560000000)
})

test('simultaneous verification can create only one session', async () => {
  const { state, controller, req, res } = setup(); await controller.sendLoginOtp(req, res); req.body.otp = codeFrom(state)
  const results = await Promise.allSettled([controller.verifyLoginOtp(req, res), controller.verifyLoginOtp(req, res)])
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
  assert.equal(state.sessions.length, 1)
})
test('expired legacy JWT is not silently revived', async () => {
  const { deps, req, res, state } = setup(); req.cookies.token = 'expired-jwt'; req.headers = {}
  deps['../utils/jwt'].verifyToken = () => { throw new Error('jwt expired') }
  const { protect } = load('middlewares/authMiddleware.js', deps)
  await assert.rejects(protect(req, res, () => {}), { statusCode: 401 })
  assert.equal(state.sessions.length, 0)
})
