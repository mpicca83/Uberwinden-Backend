import ProductManager from '../dao/ProductManager.js'
import { validateCreate, validateUpdate } from '../validators/productsValidators.js'
import { Router } from 'express'
export const router=Router()

const productManager = new ProductManager()

router.get('/', async(req, res) => {
    
    try {

        let datos = await productManager.getProducts()
        let limit = req.query.limit
        if (limit && limit > 0) datos=datos.slice(0,limit)
        
        return res.status(200).json(datos)

    } catch (error) {
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.get('/:pid', async(req, res) => {

    let pid = req.params.pid
    pid = Number(pid)

    if(isNaN(pid)) {
        return res.status(400).json({error:'Ingrese un pid numérico.'})
    }

    try {

        const data = await productManager.getProductById(pid)

        data
        ? res.status(200).json(data)
        : res.status(400).json({error:`Not found. No existe un producto con el pid ${pid}`})

    } catch (error) {
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.post('/', validateCreate, async(req, res) => {

    const {title, description, code, price, status=true, stock, category, thumbnails=[]} = req.body

    const product = {
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    }

    try {

        const newProduct = await productManager.addProduct(product)
        return res.status(200).json(newProduct)

    } catch (error) {
        
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.put('/:pid', validateUpdate, async(req, res) => {

    let pid = req.params.pid
    pid = Number(pid)

    if(isNaN(pid)) {
        return res.status(400).json({error:'Ingrese un pid numérico.'})
    }

    const data = req.body

    try {

        const update = await productManager.updateProduct(pid, data)

        update
        ? res.status(200).json(update)
        : res.status(400).json({error:`Not found. No existe un producto con el pid ${pid}`})

    } catch (error) {
        
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }

})

router.delete('/:pid', async(req, res) => {

    let pid = req.params.pid
    pid = Number(pid)

    if(isNaN(pid)) {
        return res.status(400).json({error:'Ingrese un pid numérico.'})
    }

    try {
        
        const data = await productManager.deleteProduct(pid)

        data
        ? res.status(200).json(data)
        : res.status(400).json({error:`Not found. No existe un producto con el pid ${pid}`})

    } catch (error) {
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }

})
