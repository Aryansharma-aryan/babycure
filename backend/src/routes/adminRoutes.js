const { Router } = require('express')

const { deleteContactInquiry, getContactInquiries, updateContactInquiry } = require('../controllers/contactController')
const { getDashboard, getUsers, updateUser } = require('../controllers/adminController')
const { admin, protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect, admin)

router.get('/dashboard', getDashboard)
router.get('/contact-inquiries', getContactInquiries)
router.patch('/contact-inquiries/:id', updateContactInquiry)
router.delete('/contact-inquiries/:id', deleteContactInquiry)
router.get('/users', getUsers)
router.patch('/users/:id', updateUser)

module.exports = router
