import { Router } from 'express'
import passport from 'passport'
import { validateUserLogin, validateUserRegistration } from '../validators/validateUser.js'
import jwt from 'jsonwebtoken'
import { SECRET } from '../utils.js'

export const router=Router()

router.get("/error", (req, res)=>{
    res.setHeader('Content-Type','application/json')
    return res.status(500).json(
        {
            status: 'error',
            error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle:`Fallo al autenticar...!!!`
        }
    )
})

router.post('/register',
validateUserRegistration,
passport.authenticate("register", {session: false, failureRedirect:"/api/sessions/error"}),
async(req, res) => {
    let { newUser } = req.user

    res.setHeader('Content-Type','application/json')
    return res.status(201).json({
        status: 'success',
        payload: 'Registro exitoso.',
        user: newUser
    })
})

router.post('/login', 
validateUserLogin,
passport.authenticate("login", {session: false, failureRedirect:"/api/sessions/error"}),
async(req, res) => {

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
    res.clearCookie('cookieToken')

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

router.get('/github', passport.authenticate('github',{}), (req, res) => {})

router.get('/callbackGithub', passport.authenticate('github', {session: false, failureRedirect: '/api/sessions/error'}), (req, res) => {
    let {user} =req
    let token = jwt.sign(user, SECRET, {expiresIn: "1h"})
    res.cookie("cookieToken", token, { httpOnly: true })
    //req.session.user=user //para sessions

    //if(req.session.user){ //para sessions
   
    
    //return res.redirect(`/products`)
    
    
        res.redirect(`/products`)
    res.setHeader('Content-Type','application/json')
    return res.status(200).json({
        status: 'success',
        payload: 'Login exitoso.',
        user: user
    })
})