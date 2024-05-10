import ProductManagerMongoDB from '../dao/ProductManagerMongoDB.js'
import CartManagerMongoDB from '../dao/CartManagerMongoDB.js'

import { io } from '../app.js'
import { Router } from 'express'
export const router=Router()

const productManager = new ProductManagerMongoDB()
const cartManager = new CartManagerMongoDB()

router.get('/', async(req, res) => {

    try {

        const products = await productManager.getProducts()
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('home', {products})

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

router.get('/chat', async(req, res) => {

    try {
        
        res.status(200).render('chat')

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

    try {

        const cart = await cartManager.getCartById("663b7aa5557af7ee5b48c226")
        const products = await productManager.getProducts(limit, page, sort, query)
        
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('products', {cart, products})
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

router.get('/carts/:cid', async(req, res) => {


    try {

        const cart = await cartManager.getCartById("663b7aa5557af7ee5b48c226")
        const products = await productManager.getProducts()

        res.setHeader('Content-Type','text/html')
        return res.status(200).render('carts', {cart, products})
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
