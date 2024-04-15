import ProductManager from '../dao/ProductManager.js'
import { io } from '../app.js'
import { Router } from 'express'
export const router=Router()

const productManager = new ProductManager()

router.get('/', async(req, res) => {

    try {

        const products = await productManager.getProducts()
        return res.status(200).render('home', {products})

    } catch (error) {
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
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})
