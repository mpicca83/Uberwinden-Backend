import { Router } from 'express'
import { validateForgot, validateReset, validateUserLogin, validateUserRegistration } from '../validators/validateUser.js'
import jwt from 'jsonwebtoken'
import { passportCall } from '../utils.js'
import { auth } from '../middleware/auth.js'
import { config } from '../config/config.js'
import { UserDTO } from '../dto/UserDTO.js'
import { UserController } from '../controller/UserControllers.js'
import { userService } from "../repositories/UserService.js"


export const router=Router()

const { SECRET } = config

router.post('/register', validateUserRegistration, passportCall('register'), auth(['public']), async(req, res) => {
    res.setHeader('Content-Type','application/json')
    return res.status(201).json({
        status: 'success',
        message: 'Registro exitoso.',
        user: req.user
    })
})

router.post('/login', validateUserLogin, passportCall('login'), auth(['public']), async(req, res) => {

    let {user} = req

    let token = jwt.sign(user, SECRET, {expiresIn: "1h"})

    res.cookie("cookieToken", token, { httpOnly: true })

    //req.session.user=user //para sessions

    res.setHeader('Content-Type','application/json')
    return res.status(200).json({
        status: 'success',
        message: 'Login exitoso.',
        user: user, 
        token
    })
})

router.get('/logout', async(req, res) => {

    let {web} = req.query
    let user = null
    
    let token=req.cookies["cookieToken"]
    if(token){
        jwt.verify(token, SECRET, (err, decoded) => {
            user = decoded;
        })
    }
    if(user){
        await userService.updateUser(user._id, { last_connection: Date.now() })
    }
    
    res.clearCookie('cookieToken')

        //para sessions
    // req.session.destroy(error=>{
    //     if(error){
    //         console.log(error)
    //         res.setHeader('Content-Type','application/json')
    //         return res.status(500).json(
    //             {
    //                 status: 'error',
    //                 error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
    //                 detail:`${error.message}`
    //             }
    //         )
            
    //     }
    // })

    if(web){
        return res.redirect(`/login`)
    }else{
        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            message:'Logout Exitoso...!!!'
        })    
    }
})

router.get('/github', passportCall('github'), (req, res) => {})

router.get('/callbackGithub', passportCall('github'), (req, res) => {
    let {user} =req
    let token = jwt.sign(user, SECRET, {expiresIn: "1h"})
    res.cookie("cookieToken", token, { httpOnly: true })

    //req.session.user=user //para sessions
    
    return res.redirect(`/products`)
})

router.get('/current', passportCall('current'), auth(['user', 'premium', 'admin']), (req, res) => {
    res.setHeader('Content-Type','application/json')
    return res.status(200).json({
        status: 'success',
        message: 'Datos del usuario registrado.',
        user: new UserDTO(req.user)
    })
})

router.post('/forgotPassword', auth(['public']), validateForgot, UserController.forgotPassword)

router.post('/resetPassword', auth(['public']), validateReset, UserController.resetPassword)
