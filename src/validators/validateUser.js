import { check, validationResult } from 'express-validator'
import UserManagerMongoDB from '../dao/UserManagerMongoDB.js'
import { generaHash } from '../utils.js'

const userManager = new UserManagerMongoDB()

export const validateUserRegistration = [

    check('name')
        .notEmpty().withMessage('Name es requerido.'),
    check('email')
        .notEmpty().withMessage('Email es requerido.')
        .isEmail().withMessage('Debe ser un email válido.'),
    check('password')
        .notEmpty().withMessage('Password es requerido.'),

    async (req, res, next) => {

        let {email, web} = req.body

        try {

            const validateEmail = await userManager.getUserBy({email})
            
            if(validateEmail){
                if(web){

                    return res.redirect(`/registro?error=El email ${email} ya se encuentra registrado`)

                }else{

                    return res.status(404).json({
                        status: 'error',
                        error: `El email ${email} ya se encuentra registrado.`
                    })
                }
            }

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

    async (req, res, next) => {

        let {email, password, web} = req.body


        try {

            let validateUser = null

            if(email==='adminCoder@coder.com' && password==='adminCod3r123'){
                validateUser = {
                    name: 'Administrador',
                    email: 'adminCoder@coder.com',
                    rol: 'admin'
                }

            }else{
                validateUser = await userManager.getUserBy({email, password:generaHash(password)})
            }
            if(!validateUser){

                if(web){

                    return res.redirect(`/login?error=Las credenciales no son válidas.`)
                }else{
                    return res.status(400).json({
                        status: 'error',
                        error: `Las credenciales no son válidas.`
                    })
                }
                
            }

            req.user = validateUser

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

export const auth=(req, res, next)=>{

    if(!req.session.user){

        res.setHeader('Content-Type','application/json')
        return res.status(401).json({
            status: 'error',
            error:`No existen usuarios autenticados`
        })
    }

    next()
}












