const { Router } = require('express')

const { createContactInquiry } = require('../controllers/contactController')

const router = Router()

router.post('/', createContactInquiry)

module.exports = router
