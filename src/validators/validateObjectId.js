import { check, validationResult } from 'express-validator'

export const validateObjectId = [

    check('pid')
        .optional()
        .isMongoId()
        .withMessage('El id del producto no es un id válido'),
    check('cid')
        .optional()
        .isMongoId()
        .withMessage('El id del carrito no es un id válido'),


    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            console.error(error)
            return res.status(400).json({ errors: error.array() });
        }
    }
]