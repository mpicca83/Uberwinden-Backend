import { Router } from 'express'
import { validateUserLogin, validateUserRegistration } from '../validators/validateUser.js'
import jwt from 'jsonwebtoken'
import { SECRET, passportCall} from '../utils.js'
import { auth } from '../middleware/auth.js'

export const router=Router()

// router.get("/error", (req, res)=>{
//     res.setHeader('Content-Type','application/json')
//     return res.status(500).json(
//         {
//             status: 'error',
//             error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
//             detalle:`Fallo al autenticar...!!!`
//         }
//     )
// })

router.post('/register', validateUserRegistration, passportCall('register'), auth(['public']), async(req, res) => {
    console.log(req.user)
    res.setHeader('Content-Type','application/json')
    return res.status(201).json({
        status: 'success',
        payload: 'Registro exitoso.',
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
        payload: 'Login exitoso.',
        user: user, 
        token
    })
})

router.get('/logout', async(req, res) => {

    let {web} = req.query

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
    //                 detalle:`${error.message}`
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
            payload:'Logout Exitoso...!!!'
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

router.get('/current', passportCall('current'), auth(['user', 'admin']), (req, res) => {
    res.setHeader('Content-Type','application/json')
    return res.status(200).json({
        status: 'success',
        payload: 'Datos del usuario registrado.',
        user: req.user
    })
})