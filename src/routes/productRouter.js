import ProductManagerMongoDB from '../dao/ProductManagerMongoDB.js'
import { validateCreate, validateUpdate } from '../validators/productsValidators.js'
import { io } from '../app.js'
import { isValidObjectId } from "mongoose";
import { Router } from 'express'
export const router=Router()

const productManager = new ProductManagerMongoDB()

router.get('/', async(req, res) => {
    
    try {

        let datos = await productManager.getProducts()
        let limit = req.query.limit
        if (limit && limit > 0) datos=datos.slice(0,limit)
        
        res.setHeader('Content-Type','application/json')
        return res.status(200).json(datos)

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

router.get('/:pid', async(req, res) => {

    let {pid} = req.params

    if(!isValidObjectId(pid)) {
        res.setHeader('Content-Type','application/json')
        return res.status(400).json({error:`El id ${pid} no es un id válido.`})
    }

    try {

        const data = await productManager.getProductBy({_id:pid})

        if(data){
            res.setHeader('Content-Type','application/json')
            return res.status(200).json(data); 
        }else{
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({error:`No existen producto con id ${pid}`})
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

        const existe = await productManager.getProductBy({code})
        if(existe){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`El code ${code} ya se encuentra registrado`})
        }

        const newProduct = await productManager.addProduct(product)
        io.emit('productAdd',  newProduct )
        
        res.setHeader('Content-Type','application/json')
        return res.status(200).json(newProduct)

    } catch (error) {
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.put('/:pid', validateUpdate, async(req, res) => {

    let {pid} = req.params

    if(!isValidObjectId(pid)) {
        res.setHeader('Content-Type','application/json')
        return res.status(400).json({error:`El id ${pid} no es un id válido.`})
    }

    const objetUpdate = req.body

    try {

        if(objetUpdate.code){

            const existe = await productManager.getProductBy({code:objetUpdate.code})
            
            if(existe){
                res.setHeader('Content-Type','application/json')
                return res.status(400).json({error:`El code ${objetUpdate.code} ya se encuentra registrado`})
            }
        }

        const update = await productManager.updateProduct(pid, objetUpdate)

        if(update){
            const products = await productManager.getProducts()
            io.emit('productsAll', { products })

            res.setHeader('Content-Type','application/json')
            return res.status(200).json(update)
        }else{
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({error:`No existen producto con id ${pid} / o error al modificar`})
        }

    } catch (error) {
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})

router.delete('/:pid', async(req, res) => {

    let {pid} = req.params

    if(!isValidObjectId(pid)) {
        res.setHeader('Content-Type','application/json')
        return res.status(400).json({error:`El pid ${pid} no es un id válido.`})
    }

    try {
        
        const data = await productManager.deleteProduct(pid)

        const products = await productManager.getProducts()
        io.emit('productsAll', { products })
        
        if(data.deletedCount>0){
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({payload:`Producto con id ${pid} eliminado correctamente.`})
        }else{
            res.setHeader('Content-Type','application/json')
            return res.status(404).json({error:`No existen producto con id ${pid} / o error al eliminar`})
        }
         
    } catch (error) {
        res.setHeader('Content-Type','application/json')
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                detalle:`${error.message}`
            }
        )
    }
})
