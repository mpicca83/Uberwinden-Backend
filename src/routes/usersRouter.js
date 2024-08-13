import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { validateRol } from '../validators/validateUser.js'
import { validateObjectId } from '../validators/validateObjectId.js'
import { validateExistence } from '../validators/validateExistence.js'
import { UserController } from '../controller/UserControllers.js'
import { passportCall } from '../utils.js'
import { upload } from '../middleware/multer.js'
import { validateUploadDocument } from '../validators/validateUpload.js'

export const router=Router()

const documents = [
    { name: 'identification', maxCount: 3 },
    { name: 'addressProof', maxCount: 3 },
    { name: 'bankStatement', maxCount: 3 }
]

router.post('/premium/:uid', passportCall('current'), auth(['admin']), validateObjectId, validateExistence, validateRol, UserController.updateRol)

router.post('/:uid/documents', passportCall('current'), auth(['user', 'premium']), validateObjectId, validateExistence, upload.fields(documents), validateUploadDocument, UserController.updateDocuments)