import ProductManagerMongoDB from '../dao/ProductManagerMongoDB.js'
import CartManagerMongoDB from '../dao/CartManagerMongoDB.js'
import { io } from '../app.js'
import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { SECRET } from '../utils.js'
export const router=Router()

const productManager = new ProductManagerMongoDB()
const cartManager = new CartManagerMongoDB()

router.get('/', async(req, res) => {
    let user = null
    if(req.cookies["cookieToken"]?.user){
        user = req.cookies["cookieToken"].user
    }
    res.status(200).render('home', {user: user})
})

router.get('/realtimeproducts', async(req, res) => {

    try {

        const products = await productManager.getProducts()

        io.on("connection", socket=> {
            console.log(`Se ha conectado un cliente con id ${socket.id}`)
            
            socket.emit('productsAll', { products })
        })

        return res.status(200).render('realTimeProducts', { products })

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

router.get('/chat', passport.authenticate('jwt', {session:false}), async(req, res) => {

    try {
        
        res.status(200).render('chat', {user: req.cookies["cookieToken"].user})

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

router.get('/products', async(req, res) => {

    let {limit, page, sort, category, status} = req.query

    if(sort === '1' || sort === '-1'){
        sort = { price: +sort }
    }

    let query = {}
    category && (query.category = new RegExp(category, 'i'))
    status !== undefined && (query.status = status)

    //let user = req.session.user //Con sessions
    let token = req.cookies["cookieToken"]
    let user = jwt.verify(token, SECRET)

    try {

        const products = await productManager.getProducts(limit, page, sort, query)
        
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('products', {products, user})

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

router.get('/carts/:cid', passport.authenticate('jwt', {session:false}), async(req, res) => {

    let {cid} = req.params

    try {

        const cart = await cartManager.getCartById({_id:cid})

        res.setHeader('Content-Type','text/html')
        return res.status(200).render('carts', {cart, user: req.cookies["cookieToken"]?.user})
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

router.get('/register', 
    (req, res, next)=>{
        if(req.cookies["cookieToken"]?.user){
            return res.redirect("/products")
        }
    next()
    },
    (req, res)=>{
        res.status(200).render('register')
})

router.get('/login', 
    (req, res, next)=>{
        if(req.cookies["cookieToken"]?.user){
            return res.redirect("/products")
        }
    next()
    },
    (req, res)=>{
        res.status(200).render('login')
})