import ProductManagerMongoDB from '../dao/ProductManagerMongoDB.js'
import { io } from '../app.js'
import { Router } from 'express'
export const router=Router()

const productManager = new ProductManagerMongoDB()

router.get('/', async(req, res) => {

    try {

        const products = await productManager.getProducts()
        res.setHeader('Content-Type','text/html')
        return res.status(200).render('home', {products})

    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
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
        console.log(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.get('/chat', async(req, res) => {

    try {
        
        res.status(200).render('chat')

    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})
