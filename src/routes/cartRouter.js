import CartManager from '../dao/CartManager.js'
import ProductManager from '../dao/ProductManager.js'
import { Router } from 'express'
export const router=Router()


const cartManager = new CartManager()
const productManager = new ProductManager()


router.post('/', async(req, res) => {

    try {

        const newCart = await cartManager.addCart()
        return res.status(200).json(newCart)

    } catch (error) {
        
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.get('/:cid', async(req, res) => {

    let cid = req.params.cid
    cid = Number(cid)

    if(isNaN(cid)) {
        return res.status(400).json({error:'Ingrese un cid numérico.'})
    }

    try {

        const data = await cartManager.getCartById(cid)

        data
        ? res.status(200).json(data)
        : res.status(400).json({error:`Not found. No existe un carrito con el cid ${cid}`})

    } catch (error) {
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.post('/:cid/product/:pid', async(req, res) => {

    let cid = req.params.cid
    let pid = req.params.pid
    cid = Number(cid)
    pid = Number(pid)

    if(isNaN(cid) || isNaN(pid)) {
        return res.status(400).json({error:'Ingrese un cid y un pid numérico.'})
    }

    try {

        const cart = await cartManager.getCartById(cid)
        if(!cart)
            return res.status(400).json({error:`Not found. No existe un carrito con el cid ${cid}`})

        const product = await productManager.getProductById(pid)
        if(!product)
            return res.status(400).json({error:`Not found. No existe un producto con el pid ${pid}`})


        const data = await cartManager.addProductToCart(cid, pid)

        res.status(200).json(data)

    } catch (error) {
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

