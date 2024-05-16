import { Router } from 'express'
import { validateUserRegistration, validateUserLogin } from '../validators/validateUser.js'
import { generaHash } from '../utils.js'
import UserManagerMongoDB from '../dao/UserManagerMongoDB.js'
import CartManagerMongoDB from '../dao/CartManagerMongoDB.js'

export const router=Router()

const userManager = new UserManagerMongoDB()
const cartManager = new CartManagerMongoDB()


router.post('/register', validateUserRegistration,  async(req, res) => {

    let {name, email, password, web} = req.body

    password=generaHash(password)

    try {
        
        const newCart = await cartManager.addCart()
        let newUser = await userManager.createUser({name, email, password, rol:'usuario', cart: newCart._id})

        delete newUser.password

        if(web){
            return res.redirect(`/login`)
        }else{
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                payload: newUser
            })
        }

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.post('/login', validateUserLogin, async(req, res) => {

    let {user} = req
    let {web} = req.body

    delete user.password

    req.session.user=user

    if(web){
        return res.redirect(`/products`)
    }else{
        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            payload: user
        })
    }
    
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
            payload:"Logout Exitoso...!!!"
        })    
    }
})