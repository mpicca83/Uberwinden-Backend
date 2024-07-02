import { io } from '../app.js'
import { Router } from 'express'
import { passportCall } from '../utils.js'
import { auth } from '../middleware/auth.js'
import { productService } from '../repositories/ProductService.js'
import { cartService } from '../repositories/CartService.js'
import { MockingController } from '../controller/MockingController.js'
export const router=Router()

router.get('/', auth(['public']), async(req, res) => {
    let user = req.user
    res.status(200).render('home', {user: user})
})

router.get('/realtimeproducts', auth(['public']), async(req, res) => {

    try {

        const products = await productService.getProducts()

        io.on("connection", socket=> {
            console.log(`Se ha conectado un cliente con id ${socket.id}`)
            
            socket.emit('productsAll', { products })
        })

        return res.status(200).render('realTimeProducts', { products })

    } catch (error) {
        console.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detail:`${error.message}`
            }
        )
    }
})

router.get('/chat', passportCall("current"), auth(['user']), async(req, res) => {

    try {

        res.setHeader('Content-Type','text/html')
        return res.status(200).render('chat', {user: req.user})

    } catch (error) {
        console.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detail:`${error.message}`
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

    try {

        const products = await productService.getProducts(limit, page, sort, query)
        
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('products', {products, user: user})

    } catch (error) {
        console.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detail:`${error.message}`
            }
        )
    }
})

router.get('/carts/:cid', passportCall("current"), auth(['user', 'admin']), async(req, res) => {

    let {cid} = req.params

    try {

        const cart = await cartService.getCartById({_id:cid})

        res.setHeader('Content-Type','text/html')
        return res.status(200).render('carts', {cart, user: req.user})
    } catch (error) {
        console.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detail:`${error.message}`
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

    try {

        const products = MockingController.generateMockingProducts()
        
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('mockingProducts', {products, user: req.user})

    } catch (error) {
        console.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error: 'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detail:`${error.message}`
            }
        )
    }


})
