const { Router } = require('express')

const { shiprocketWebhook } = require('../controllers/shiprocketController')

const router = Router()

// Shiprocket recommends a callback URL without provider-name keywords.
router.post('/', shiprocketWebhook)

module.exports = router
