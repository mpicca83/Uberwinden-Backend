import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { validateRol } from '../validators/validateUser.js'
import { validateObjectId } from '../validators/validateObjectId.js'
import { validateExistence } from '../validators/validateExistence.js'
import { UserController } from '../controller/UserControllers.js'


export const router=Router()

router.post('/premium/:uid', auth(['admin']), validateObjectId, validateExistence, validateRol, UserController.updateRol)