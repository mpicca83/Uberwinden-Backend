import { io } from '../app.js'
import { Router } from 'express'
import { passportCall } from '../utils.js'
import { auth } from '../middleware/auth.js'
import { productService } from '../repositories/ProductService.js'
import { cartService } from '../repositories/CartService.js'
import { MockingController } from '../controller/MockingController.js'
import { userService } from '../repositories/UserService.js'
import { UserDTO, UserDTO2 } from '../dto/UserDTO.js'
export const router=Router()

router.get('/', auth(['public']), async(req, res) => {
    let user = req.user
    let admin = false
    user.rol==='admin' && (admin = true)
    res.status(200).render('home', {user: user, admin})
})

router.get('/realtimeproducts', auth(['public']), async(req, res) => {

    try {

        const products = await productService.getProducts()

        io.on("connection", socket=> {
            req.logger.http(`Se ha conectado un cliente con id ${socket.id}`)
            
            socket.emit('productsAll', { products })
        })

        return res.status(200).render('realTimeProducts', { products })

    } catch (error) {
        req.logger.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Internal Server Error',
                message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
        }
        )
    }
})

router.get('/chat', passportCall("current"), auth(['user', 'premium']), async(req, res) => {

    try {
        let admin = false
        req.user.rol==='admin' && (admin = true)
    
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('chat', {user: req.user, admin})

    } catch (error) {
        req.logger.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Internal Server Error',
                message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
        }
        )
    }
})

router.get('/products', auth(['public']),  async(req, res) => {

    let {limit, page, sort, category, status} = req.query

    if(sort === '1' || sort === '-1'){
        sort = { price: +sort }
    }

    let query = {}
    category && (query.category = new RegExp(category, 'i'))
    status !== undefined && (query.status = status)

    //let user = req.session.user //Con sessions
    let user = req.user
    let admin = false
    
    if (user && user.rol === 'admin') admin = true

    try {

        const products = await productService.getProducts(limit, page, sort, query)
        
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('products', {products, user: user, admin})

    } catch (error) {
        req.logger.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Internal Server Error',
                message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
        }
        )
    }
})

router.get('/carts/:cid', passportCall("current"), auth(['user', 'premium', 'admin']), async(req, res) => {

    let {cid} = req.params
    let admin = false
    req.user.rol==='admin' && (admin = true)

    try {

        const cart = await cartService.getCartById({_id:cid})

        res.setHeader('Content-Type','text/html')
        return res.status(200).render('carts', {cart, user: req.user, admin})
    } catch (error) {
        req.logger.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Internal Server Error',
                message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
        }
        )
    }
})

router.get('/register', auth(['public']), (req, res)=>{

    if(req.cookies["cookieToken"]){
        return res.redirect("/products")
    }else{
        return res.status(200).render('register')
    }
})

router.get('/login', auth(['public']), (req, res)=>{

    if(req.cookies["cookieToken"]){
        return res.redirect("/products")
    }else{
        return res.status(200).render('login') 
    }
})

router.get('/mockingproducts', auth(['public']),  async(req, res) => {

    let admin = false
    req.user.rol==='admin' && (admin = true)

    try {

        const products = MockingController.generateMockingProducts()
        
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('mockingProducts', {products, user: req.user, admin})

    } catch (error) {
        req.logger.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Internal Server Error',
                message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
        })
    }
})

router.get('/forgotPassword', auth(['public']), (req, res)=>{

    if(req.cookies["cookieToken"]){
        return res.redirect("/products")
    }else{
        return res.status(200).render('forgotPassword') 
    }
})

router.get('/resetPassword', auth(['public']), (req, res)=>{

    let {token} = req.query

    if(req.cookies["cookieToken"]){
        return res.redirect("/products")
    }else{
        return res.status(200).render('resetPassword',{token}) 
    }
})

router.get('/settings', passportCall("current"), auth(['admin']), async(req, res)=>{
    
    try {
        let admin = false
        req.user.rol==='admin' && (admin = true)
    
        let users = await userService.getUsers()
        users = users.map(user => new UserDTO2(user))
        return res.status(200).render('settings', {users, user: req.user, admin})

    } catch (error) {
        req.logger.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Internal Server Error',
                message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
        })
    }
    
})
