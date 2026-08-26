const { Router } = require('express')

const { deleteContactInquiry, getContactInquiries, updateContactInquiry } = require('../controllers/contactController')
const { deleteAllOrders, deleteAllUsers, deleteOrder, deleteUser, getDashboard, getUsers, updateUser } = require('../controllers/adminController')
const { admin, protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect, admin)

router.get('/dashboard', getDashboard)
router.get('/contact-inquiries', getContactInquiries)
router.patch('/contact-inquiries/:id', updateContactInquiry)
router.delete('/contact-inquiries/:id', deleteContactInquiry)
router.get('/users', getUsers)
router.delete('/users', deleteAllUsers)
router.delete('/users/:id', deleteUser)
router.patch('/users/:id', updateUser)
router.delete('/orders', deleteAllOrders)
router.delete('/orders/:id', deleteOrder)

module.exports = router
