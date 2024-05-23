import { check, validationResult } from 'express-validator'

export const validateUserRegistration = [

    check('name')
        .notEmpty().withMessage('Name es requerido.'),
    check('email')
        .notEmpty().withMessage('Email es requerido.')
        .isEmail().withMessage('Debe ser un email válido.'),
    check('password')
        .notEmpty().withMessage('Password es requerido.'),

    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            console.error(error)
            return res.status(400).json({ 
                status: 'error',
                errors: error.array() 
            })
        }
    }
]

export const validateUserLogin = [

    check('email')
        .notEmpty().withMessage('Email es requerido.')
        .isEmail().withMessage('Debe ser un email válido.'),
    check('password')
        .notEmpty().withMessage('Password es requerido.'),

    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            console.error(error)
            return res.status(400).json({ 
                status: 'error',
                errors: error.array()
            })
        }
    }
]
