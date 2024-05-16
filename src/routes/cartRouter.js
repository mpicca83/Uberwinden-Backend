import CartManagerMongoDB from '../dao/CartManagerMongoDB.js'
import { validateCart } from '../validators/validateCart.js'
import { validateExistence } from '../validators/validateExistence.js'
import { validateObjectId } from '../validators/validateObjectId.js'
import { Router } from 'express'
import { auth } from '../validators/validateUser.js'
export const router=Router()

const cartManager = new CartManagerMongoDB()

router.post('/', async(req, res) => {

    try {

        const newCart = await cartManager.addCart()

        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            payload: newCart
        })

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.get('/:cid', [auth, validateObjectId, validateExistence], async(req, res) => {

    let {cid} = req.params

    try {

        const data = await cartManager.getCartById(cid)

        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'seccess',
            payload: data
        }) 

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.post('/:cid/product/:pid', [auth, validateObjectId, validateExistence], async(req, res) => {

    const { cid, pid } = req.params

    try {

        let cart = await cartManager.getCartById(cid)

        let quantityError = false
        cart.products.forEach(i => {
            if(i.product._id == pid){
                if(i.quantity === i.product.stock ){
                    quantityError = true
                }
            }
        })

        if(quantityError){
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({
                status: 'error',
                error:`No es posible incrementar el quantity en más del stock.`
            })
        }

        let data = await cartManager.incQuantity(cid, pid)
        !data && (data = await cartManager.addProductToCart(cid, { product: pid, quantity: 1 }))
        
        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            payload: data
        })

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.delete('/:cid/products/:pid', [auth, validateObjectId, validateExistence], async(req, res) => {

    const { cid, pid } = req.params

    try {

        let cart = await cartManager.getCartById(cid)
        
        let productId = null
        cart.products.forEach(i => {
            if(i.product._id.toString() === pid){
                productId = i._id.toString() 
            }
        })

        if(productId){

            const data = await cartManager.deleteProductToCart(cid, productId)
            
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                payload: data
            })
        }else{
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({
                status: 'error',
                error:`No existe un producto con id ${pid} en el carrito`
            })
        }

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.delete('/:cid', [auth, validateObjectId, validateExistence], async(req, res) => {

    const { cid } = req.params

    try {
        
        const data = await cartManager.deleteProductsToCart(cid)
            
        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            payload: data
        })

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.put('/:cid/products/:pid', [auth, validateObjectId, validateExistence], async(req, res) => {

    const { cid, pid } = req.params
    const { quantity } = req.body

    if(!quantity || quantity < 1){
        res.setHeader('Content-Type','application/json')
        return res.status(400).json({
            status: 'error',
            error:`Quantity debe ser mayor a 0.`
        })

    }

    try {

        const data = await cartManager.updateQuantityToProduct(cid, pid, quantity)

        if(!data){
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({
                status: 'error',
                error:`No existe un producto con id ${pid} en el carrito`
            })
        }
                
        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            payload: data
        })

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.put('/:cid', [auth, validateObjectId, validateExistence, validateCart], async(req, res) => {

    const { cid } = req.params
    const objetUpdate = req.body

    try {
        
        const data = await cartManager.updateCart(cid, objetUpdate)
            
        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            payload: data
        })

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.put('/incQuantity/:cid/products/:pid', [auth, validateObjectId, validateExistence], async(req, res) => {

    const { cid, pid } = req.params

    try {

        let cart = await cartManager.getCartById(cid)

        let quantityError = false
        cart.products.forEach(i => {
            if(i.product._id == pid){
                if(i.quantity === i.product.stock ){
                    quantityError = true
                }
            }
        })

        if(quantityError){
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({
                status: 'error',
                error:`No es posible incrementar el quantity en más del stock.`
            })
        }

        const data = await cartManager.incQuantity(cid, pid)

        if(!data){
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({
                status: 'error',
                error:`No existe un producto con id ${pid} en el carrito`
            })
        }
                
        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            payload: data
        })

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.put('/decQuantity/:cid/products/:pid', [auth, validateObjectId, validateExistence], async(req, res) => {

    const { cid, pid } = req.params

    try {

        let cart = await cartManager.getCartById(cid)

        let quantityError = false
        cart.products.forEach(i => {
            if(i.product._id == pid){
                if(i.quantity === 1 ){
                    quantityError = true
                }
            }
        })

        if(quantityError){
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({
                status: 'error',
                error:`No es posible decrementar el quantity en menos de 1.`
            })
        }

        const data = await cartManager.decQuantity(cid, pid)

        if(!data){
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({
                status: 'error',
                error:`No existe un producto con id ${pid} en el carrito`
            })
        }
                
        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            payload: data
        })

    } catch (error) {
        console.error(error)
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})
