const { Router } = require('express')

const {
  createAddress,
  deleteAddress,
  getAddressById,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} = require('../controllers/addressController')
const { protect } = require('../middlewares/authMiddleware')

const router = Router()

router.use(protect)

router.route('/').post(createAddress).get(getAddresses)
router.route('/:id').get(getAddressById).put(updateAddress).delete(deleteAddress)
router.patch('/:id/default', setDefaultAddress)

module.exports = router
