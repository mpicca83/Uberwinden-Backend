import { validateCreate, validateUpdate } from '../validators/validateProducts.js'
import { validateObjectId } from '../validators/validateObjectId.js'
import { validateExistence } from '../validators/validateExistence.js'
import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { passportCall } from '../utils.js'
import { ProcuctController } from '../controller/ProductController.js'

export const router=Router()

router.get('/', auth(['public']), ProcuctController.getProducts)

router.get('/:pid', auth(['public']), validateObjectId, validateExistence, ProcuctController.getProductBy)

router.post('/', passportCall('current'), auth(['premium', 'admin']), validateCreate, ProcuctController.createProduct)

router.put('/:pid', passportCall('current'), auth(['premium', 'admin']), validateUpdate, validateObjectId, validateExistence, ProcuctController.updateProduct)

router.delete('/:pid', passportCall('current'), auth(['premium', 'admin']), validateObjectId, validateExistence, ProcuctController.deleteProduct)
