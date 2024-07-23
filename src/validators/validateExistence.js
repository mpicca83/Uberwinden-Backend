import { validationResult } from 'express-validator'
import { cartService } from '../repositories/CartService.js'
import { productService } from '../repositories/ProductService.js'
import { userService } from '../repositories/UserService.js'

export const validateExistence = async (req, res, next) => {

    const { cid, pid, uid } = req.params

    try {

        // Verificar si el carrito existe
        if(cid){
            const cart = await cartService.getCartById(cid)
            if (!cart) {
                
                return res.status(404).json({
                    status: 'error',
                    message: `No existe un carrito con id ${cid}`
                })
            }
        }
        // Verificar si el producto existe
        if(pid){
            const product = await productService.getProductBy({ _id: pid })
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: `No existe un producto con id ${pid}`
                })
            }
        }
        // Verificar si el usuario existe
        if(uid){
            const user = await userService.getUserBy({ _id: uid })
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: `No existe un usuario con id ${uid}`
                })
            }
        }

    } catch (error) {
        req.logger.error(error.message)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde o contacte a su administrador',
            }
        )
    }

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ 
    //         status: 'error',
    //         errors: errors.array() 
    //     })
    // }

    next()
}
