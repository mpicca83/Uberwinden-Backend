import ProductManagerMongoDB from '../dao/ProductManagerMongoDB.js'
import { io } from '../app.js'
import { config } from '../config/config.js'

const productManager = new ProductManagerMongoDB()
const { PORT } = config

export class ProcuctController{

    static getProducts=async(req, res) => {

        let {limit, page, sort, category, status} = req.query
    
        if(sort === '1' || sort === '-1'){
            sort = { price: +sort }
        }
    
        let query = {}
        category && (query.category = new RegExp(category, 'i'))
        status !== undefined && (query.status = status)
    
        try {
    
            let datos = await productManager.getProducts(limit, page, sort, query)
          
            let prevLink = datos.hasPrevPage ? `/localhost:${PORT}/api/products?page=${datos.prevPage}` : null
            let nextLink = datos.hasNextPage ? `/localhost:${PORT}/api/products?page=${datos.nextPage}` : null
    
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                payload: datos.docs,
                totalPages: datos.totalPages,
                prevPage: datos.prevPage,
                nextPage: datos.nextPage,
                page: datos.page,
                hasPrevPage: datos.hasPrevPage,
                hasNextPage: datos.hasNextPage,
                prevLink: prevLink,
                nextLink: nextLink
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
    }

    static getProductBy=async(req, res) => {

        let {pid} = req.params
    
        try {
    
            const data = await productManager.getProductBy({_id:pid})
    
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
    }

    static createProduct=async(req, res) => {

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
                return res.status(400).json({
                    status: 'error',
                    error:`El code ${code} ya se encuentra registrado`
                })
            }
    
            const newProduct = await productManager.addProduct(product)
            io.emit('productAdd',  newProduct )
            
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                payload: newProduct
            })
    
        } catch (error) {
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detalle:`${error.message}`
                }
            )
        }
    }

    static updateProduct=async(req, res) => {

        let {pid} = req.params
        const objetUpdate = req.body
    
        try {
    
            if(objetUpdate.code){
    
                const existe = await productManager.getProductBy({code:objetUpdate.code})
                
                if(existe){
                    res.setHeader('Content-Type','application/json')
                    return res.status(400).json({
                        status: 'error',
                        error:`El code ${objetUpdate.code} ya se encuentra registrado`
                    })
                }
            }
    
            const update = await productManager.updateProduct(pid, objetUpdate)
    
            const products = await productManager.getProducts()
            io.emit('productsAll', { products })
    
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                payload: update
            })
    
        } catch (error) {
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detalle:`${error.message}`
                }
            )
        }
    }

    static deleteProduct=async(req, res) => {

        let {pid} = req.params
    
        try {
            
            const data = await productManager.deleteProduct(pid)
    
            const products = await productManager.getProducts()
            io.emit('productsAll', { products })
            
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                payload:`Producto con id ${pid} eliminado correctamente.`
            })
             
        } catch (error) {
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detalle:`${error.message}`
                }
            )
        }
    }

}