import { validateCart } from '../validators/validateCart.js'
import { validateExistence } from '../validators/validateExistence.js'
import { validateObjectId } from '../validators/validateObjectId.js'
import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { passportCall } from '../utils.js'
import { CartController } from '../controller/CartController.js'

export const router=Router()

router.post('/', auth(['public']), CartController.addCart)

router.get('/:cid', passportCall('current'), auth(['user', 'premium', 'admin']), validateObjectId, validateExistence, CartController.getCart)

router.put('/:cid', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, validateCart, CartController.updateCart)

router.delete('/:cid', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, CartController.deleteProductsToCart)

router.post('/:cid/product/:pid', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, CartController.addProductToCart)

router.put('/:cid/products/:pid', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, CartController.updateQuantityToProduct)

router.delete('/:cid/products/:pid', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, CartController.deleteProductToCart)

router.put('/incQuantity/:cid/products/:pid', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, CartController.updateIncQuantityToProduct)

router.put('/decQuantity/:cid/products/:pid', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, CartController.updateDecQuantityToProduct)

router.post('/:cid/purchase', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, CartController.purchaseCart)