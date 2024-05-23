import { Router } from 'express'
import passport from 'passport'
import { validateUserLogin, validateUserRegistration } from '../validators/validateUser.js'

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
    passport.authenticate("register", {failureRedirect:"/api/sessions/error"}),
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
passport.authenticate("login", {failureRedirect:"/api/sessions/error"}),
async(req, res) => {

    let {user} = req
    req.session.user=user

    res.setHeader('Content-Type','application/json')
    return res.status(200).json({
        status: 'success',
        payload: 'Login exitoso.',
        user: user
    })
})

router.get('/logout', async(req, res) => {

    let {web} = req.query
    
    req.session.destroy(error=>{
        if(error){
            console.log(error)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle:`${error.message}`
                }
            )
            
        }
    })

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

router.get('/callbackGithub', passport.authenticate('github', {failureRedirect: '/api/sessions/error'}), (req, res) => {
    
    req.session.user = req.user

    if(req.session.user){
        return res.redirect(`/products`)
    }else{
        return res.redirect(`/login`)
    }

    // res.setHeader('Content-Type','application/json')
    // return res.status(200).json({
    //     status: 'success',
    //     payload: 'Login exitoso.',
    //     user: req.user
    // })
})