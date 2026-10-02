const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const path = require('node:path')
const id = '123456789012345678901234'
function setup(stock = 10) {
  const product = { _id: id, name: 'Lotion', stock, price: 120, isActive: true }
  let saved = { _id: 'cart', __v: 0, guestMergeIds: [], items: [{ product: id, quantity: 2, priceAtTime: 120 }] }
  const copy = () => ({ ...structuredClone(saved), recalculateTotal() { return this.items.reduce((sum, item) => sum + item.quantity * item.priceAtTime, 0) } })
  const Cart = {
    findOne: async () => copy(),
    findById: () => ({ populate: async () => copy() }),
    findOneAndUpdate: async (filter, update) => {
      if (filter.__v !== saved.__v || saved.guestMergeIds.includes(filter.guestMergeIds.$ne)) return null
      saved = { ...saved, ...structuredClone(update.$set), __v: saved.__v + 1, guestMergeIds: [...saved.guestMergeIds, update.$push.guestMergeIds] }
      return copy()
    },
  }
  class AppError extends Error { constructor(message, statusCode) { super(message); this.statusCode = statusCode } }
  const deps = { mongoose: { isValidObjectId: value => typeof value === 'string' && /^[a-f0-9]{24}$/.test(value) }, '../models/Cart': Cart, '../models/Product': { find: async () => stock < 0 ? [] : [product] }, '../utils/AppError': AppError, '../utils/asyncHandler': fn => fn }
  const module = { exports: {} }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/controllers/cartController.js'), 'utf8'), { module, require: name => deps[name] })
  const req = { user: { _id: 'user' }, body: { mergeId: 'guest-1', items: [{ productId: id, quantity: 3 }] } }
  const res = { status() { return this }, json(body) { this.body = body } }
  return { merge: module.exports.mergeGuestCart, req, res, saved: () => saved }
}
test('guest bag merges existing quantities using server price, and retries are idempotent', async () => {
  const { merge, req, res, saved } = setup()
  req.body.items[0].price = 1
  await merge(req, res)
  await merge(req, res)
  assert.equal(saved().items[0].quantity, 5)
  assert.equal(saved().cartTotal, 600)
  assert.equal(saved().guestMergeIds.length, 1)
})
test('concurrent requests for the same guest bag merge only once', async () => {
  const { merge, req, res, saved } = setup()
  await Promise.all([merge(req, res), merge(req, res)])
  assert.equal(saved().items[0].quantity, 5)
})
test('merge caps quantities to current stock and explains adjustment', async () => {
  const { merge, req, res, saved } = setup(4)
  await merge(req, res)
  assert.equal(saved().items[0].quantity, 4)
  assert.match(res.body.message, /adjusted/)
})
test('invalid quantities and duplicate products are rejected before mutation', async () => {
  for (const items of [[{ productId: id, quantity: -1 }], [{ productId: id, quantity: 1.2 }], [{ productId: id, quantity: 1 }, { productId: id, quantity: 1 }]]) {
    const { merge, req, res, saved } = setup()
    req.body.items = items
    await assert.rejects(merge(req, res), { statusCode: 400 })
    assert.equal(saved().items[0].quantity, 2)
  }
})
test('guest storage survives reload, edits, and removal', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../client/src/context/CartContext.jsx'), 'utf8')
  const storage = new Map()
  const localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
  const load = () => {
    const context = { localStorage, crypto: require('node:crypto'), toast: { error() {} } }
    vm.createContext(context)
    vm.runInContext(source.slice(source.indexOf('const GUEST_KEY'), source.indexOf('export function')), context)
    return context
  }
  let context = load()
  context.saveBag([{ id, quantity: 2 }])
  context = load()
  assert.equal(context.readBag().items[0].quantity, 2)
  context.saveBag([{ id, quantity: 3 }])
  assert.equal(load().readBag().items[0].quantity, 3)
  context.saveBag([])
  assert.equal(load().readBag().items.length, 0)
  storage.set('babycure:guest-bag', '{broken')
  assert.equal(load().readBag().items.length, 0)
})
