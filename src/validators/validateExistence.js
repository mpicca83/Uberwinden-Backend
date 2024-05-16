import { validationResult } from 'express-validator'
import CartManagerMongoDB from '../dao/CartManagerMongoDB.js'
import ProductManagerMongoDB from '../dao/ProductManagerMongoDB.js'

const cartManager = new CartManagerMongoDB()
const productManager = new ProductManagerMongoDB()

export const validateExistence = async (req, res, next) => {

    const { pid, cid } = req.params

    try {

        // Verificar si el carrito existe
        if(cid){
            const cart = await cartManager.getCartById(cid)
            if (!cart) {
                return res.status(404).json({
                    status: 'error',
                    error: `No existe un carrito con id ${cid}`
                })
            }
        }
        // Verificar si el producto existe
        if(pid){
            const product = await productManager.getProductBy({ _id: pid })
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    error: `No existe un producto con id ${pid}`
                })
            }
        }

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde o contacte a su administrador',
            }
        )
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            status: 'error',
            errors: errors.array() 
        })
    }

    next()
}
