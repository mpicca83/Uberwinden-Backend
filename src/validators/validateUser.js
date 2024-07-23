import { check, validationResult } from 'express-validator'

export const validateUserRegistration = [

    check('first_name')
        .notEmpty().withMessage('Name es requerido.'),
    check('last_name')
        .optional(),
    check('email')
        .notEmpty().withMessage('Email es requerido.')
        .isEmail().withMessage('Debe ser un email válido.'),
    check('age')
        .optional()
        .isNumeric().withMessage('Edad debe ser un número.'),
    check('password')
        .notEmpty().withMessage('Password es requerido.'),

    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            return res.status(400).json({ 
                status: 'error',
                message: error.array() 
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
            return res.status(400).json({ 
                status: 'error',
                message: error.array()
            })
        }
    }
]

export const validateForgot = [

    check('email')
        .notEmpty().withMessage('Email es requerido.')
        .isEmail().withMessage('Debe ser un email válido.'),

    async (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            return res.status(400).json({ 
                status: 'error',
                message: error.array()
            })
        }
    }
]

export const validateReset = [

    check('password')
        .notEmpty().withMessage('Password es requerido.'),

    async (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            return res.status(400).json({ 
                status: 'error',
                message: error.array()
            })
        }
    }
]

export const validateRol = [

    check('rol')
        .notEmpty().withMessage('Rol es requerido.')
        .custom((value, {req}) => {
            if(req.body.rol !== 'user' && req.body.rol !== 'premium'){
                throw new Error('Solo se admiten las opciones user y premium.')
            }
            return true
        }),
    async (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            return res.status(400).json({ 
                status: 'error',
                message: error.array()
            })
        }
    }
]

