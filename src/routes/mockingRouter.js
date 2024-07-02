import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { MockingController } from '../controller/MockingController.js'

export const router=Router()

router.get('/mockingproducts', auth(['public']), MockingController.getMockingProducts)
