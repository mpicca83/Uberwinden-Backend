import { validateCreate, validateUpdate } from '../validators/validateProducts.js'
import { validateObjectId } from '../validators/validateObjectId.js'
import { validateExistence } from '../validators/validateExistence.js'
import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { passportCall } from '../utils.js'
import { ProcuctController } from '../controller/productController.js'

export const router=Router()

router.get('/', auth(['public']), ProcuctController.getProducts)

router.get('/:pid', auth(['public']), validateObjectId, validateExistence, ProcuctController.getProductBy)

router.post('/', passportCall('current'), auth(['admin']), validateCreate, ProcuctController.createProduct)

router.put('/:pid', passportCall('current'), auth(['admin']), validateUpdate, validateObjectId, validateExistence, ProcuctController.updateProduct)

router.delete('/:pid', passportCall('current'), auth(['admin']), validateObjectId, validateExistence, ProcuctController.deleteProduct)
