const { Router } = require('express')

const { getDashboard, getUsers, updateUser } = require('../controllers/adminController')
const { admin, protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect, admin)

router.get('/dashboard', getDashboard)
router.get('/users', getUsers)
router.patch('/users/:id', updateUser)

module.exports = router
