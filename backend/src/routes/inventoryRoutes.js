const { Router } = require('express')

const { adjustStock, getLowStockProducts, getStockHistory } = require('../controllers/inventoryController')
const { admin, protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect, admin)

router.get('/low-stock', getLowStockProducts)
router.patch('/products/:productId/stock', adjustStock)
router.get('/products/:productId/history', getStockHistory)

module.exports = router
