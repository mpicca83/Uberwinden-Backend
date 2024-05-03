import CartManagerMongoDB from '../dao/CartManagerMongoDB.js'
import ProductManagerMongoDB from '../dao/ProductManagerMongoDB.js'
import { isValidObjectId } from "mongoose";
import { Router } from 'express'
export const router=Router()

const cartManager = new CartManagerMongoDB()
const productManager = new ProductManagerMongoDB()

router.post('/', async(req, res) => {

    try {

        const newCart = await cartManager.addCart()

        res.setHeader('Content-Type','application/json')
        return res.status(200).json(newCart)

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

router.get('/:cid', async(req, res) => {

    let {cid} = req.params

    if(!isValidObjectId(cid)) {
        res.setHeader('Content-Type','application/json')
        return res.status(400).json({error:`El id: ${cid} no es un id válido.`})
    }

    try {

        const data = await cartManager.getCartById(cid)

        if(data){
            res.setHeader('Content-Type','application/json')
            return res.status(200).json(data); 
        }else{
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({error:`No existen un carrito con id ${cid}`})
        }

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

router.post('/:cid/product/:pid', async(req, res) => {

    const { cid, pid } = req.params

    if(!isValidObjectId(pid)) {
        res.setHeader('Content-Type','application/json')
        return res.status(400).json({error:`El id ${pid} no es un id válido.`})
    }

    if(!isValidObjectId(cid)) {
        res.setHeader('Content-Type','application/json')
        return res.status(400).json({error:`El id ${cid} no es un id válido`})
    }

    try {

        let cart = await cartManager.getCartById(cid)
        if(!cart){
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({error:`No existen un carrito con id ${cid}`})
        }

        let product = await productManager.getProductBy({_id:pid})
        if(!product){
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({error:`No existen un producto con id ${pid}`})
        }

        const productIndex = cart.products.findIndex(product => product.productId === pid)
        
        if(productIndex === -1){
                cart.products.push({ productId: pid, quantity: 1 })
        }else{
            cart.products[productIndex].quantity ++
        }

        const data = await cartManager.addProductToCart(cid, cart)
        
        res.setHeader('Content-Type','application/json')
        return res.status(200).json(data)

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

