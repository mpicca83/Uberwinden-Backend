import { check, validationResult } from 'express-validator'

export const validateCreate = [
    check('title')
        .notEmpty().withMessage('Title es requerido.'),
    check('description')
        .notEmpty().withMessage('Description es requerida.'),
    check('code')
        .notEmpty().withMessage('Code es requerido.'),
    check('price')
        .notEmpty().withMessage('Price es requerido.')
        .isNumeric().withMessage('Price debe ser numérico.'),
    check('stock')
        .notEmpty().withMessage('Stock es requerido.')
        .isNumeric().withMessage('Stock debe ser numérico.'),
    check('category')
        .notEmpty().withMessage('Category es requerida.'),
    check('status')
        .optional()
        .isBoolean().withMessage('Status debe ser booleano.'),
    check('thumbnails')
        .optional()
        .isArray().withMessage('Thumbnails debe ser array de stryng.'),

    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            res.status(403).json({ errors: error.array() });
        }
    }
]

export const validateUpdate = [
    check('title')
        .optional(),
    check('description')
        .optional(),
    check('code')
        .optional(),
    check('price')
        .optional()
        .isNumeric().withMessage('Price debe ser numérico.'),
    check('stock')
        .optional()
        .isNumeric().withMessage('Stock debe ser numérico.'),
    check('category')
        .optional(),
    check('status')
        .optional()
        .isBoolean().withMessage('Status debe ser booleano.'),
    check('thumbnails')
        .optional()
        .isArray().withMessage('Thumbnails debe ser array de stryng.'),


    (req, res, next) => {

        const keysValidas = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails']
        const keys = Object.keys(req.body)
        const valido = keys.every(key => keysValidas.includes(key))

        if(!valido){
            return res.status(400).json({error:'Solo es posible modificar los siguientes parametros: title, description, code, price, status, stock, category, thumbnails'})
        }

        next()
    },
    
    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            res.status(403).json({ errors: error.array() });
        }
    }
]
