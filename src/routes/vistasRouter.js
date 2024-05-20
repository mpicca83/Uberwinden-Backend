import ProductManagerMongoDB from '../dao/ProductManagerMongoDB.js'
import CartManagerMongoDB from '../dao/CartManagerMongoDB.js'
import { io } from '../app.js'
import { Router } from 'express'
import { auth } from '../middleware/auth.js'
export const router=Router()

const productManager = new ProductManagerMongoDB()
const cartManager = new CartManagerMongoDB()

router.get('/', async(req, res) => {
    res.status(200).render('home', {user: req.session.user})
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

router.get('/chat', auth, async(req, res) => {

    try {
        
        res.status(200).render('chat', {user: req.session.user})

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

    let user = req.session.user
    
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

router.get('/carts/:cid', auth, async(req, res) => {

    let {cid} = req.params

    try {

        const cart = await cartManager.getCartById({_id:cid})

        res.setHeader('Content-Type','text/html')
        return res.status(200).render('carts', {cart, user: req.session.user})
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
        if(req.session.user){
            return res.redirect("/products")
        }
    next()
    },
    (req, res)=>{
        res.status(200).render('register',{user: req.session.user})
})

router.get('/login', 
    (req, res, next)=>{
        if(req.session.user){
            return res.redirect("/products")
        }
    next()
    },
    (req, res)=>{
        res.status(200).render('login',{user: req.session.user})
})