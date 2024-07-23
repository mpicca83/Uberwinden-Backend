import { io } from '../app.js'
import { config } from '../config/config.js'
import { productService } from '../repositories/ProductService.js'

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
    
            let datos = await productService.getProducts(limit, page, sort, query)
          
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
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detail:`${error.message}`
                }
            )
        }
    }

    static getProductBy=async(req, res) => {

        let {pid} = req.params
    
        try {
    
            const data = await productService.getProductBy({_id:pid})
    
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                payload: data
            }) 
    
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detail:`${error.message}`
                }
            )
        }
    }

    static createProduct=async(req, res) => {

        const {title, description, code, price, status=true, stock, category, thumbnails=[]} = req.body
        const {user} = req
        let owner = ''

        user.rol === 'premium' ? (owner=user.email) : (owner='admin')
    
        const product = {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails,
            owner
        }
    
        try {
    
            const existe = await productService.getProductBy({code})
            if(existe){
                res.setHeader('Content-Type','application/json');
                return res.status(400).json({
                    status: 'error',
                    error:`El code ${code} ya se encuentra registrado`
                })
            }
    
            const newProduct = await productService.addProduct(product)
            io.emit('productAdd',  newProduct )
            
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                payload: newProduct
            })
    
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detail:`${error.message}`
                }
            )
        }
    }

    static updateProduct=async(req, res) => {

        let {pid} = req.params
        const objetUpdate = req.body
        const {user} = req
        let update = {}
    
        try {
    
            if(objetUpdate.code){
    
                const existe = await productService.getProductBy({code:objetUpdate.code})
                
                if(existe){
                    res.setHeader('Content-Type','application/json')
                    return res.status(400).json({
                        status: 'error',
                        error:`El code ${objetUpdate.code} ya se encuentra registrado`
                    })
                }
            }

            const product = await productService.getProductBy({_id:pid})
            if(user.rol === 'admin' || user.rol === 'premium' && user.email === product.owner){
                update = await productService.updateProduct(pid, objetUpdate)

                const products = await productService.getProducts()
                io.emit('productsAll', { products })
        
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'Producto actualizado correctamente.',
                    payload: update
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(400).json({
                    status: 'error',
                    message: 'No posee los permisos suficientes para realizar esta acción.'
                })
            }
    
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detail:`${error.message}`
                }
            )
        }
    }

    static deleteProduct=async(req, res) => {

        const {pid} = req.params
        const {user} = req
    
        try {
            
            const product = await productService.getProductBy({_id:pid})
            if(user.rol === 'admin' || user.rol === 'premium' && user.email === product.owner){
                
                await productService.deleteProduct(pid)

                const products = await productService.getProducts()
                io.emit('productsAll', { products })
        
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message:`Producto con id ${pid} eliminado correctamente.`
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(400).json({
                    status: 'error',
                    message: 'No posee los permisos suficientes para realizar esta acción.'
                })
            }
             
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detail:`${error.message}`
                }
            )
        }
    }

}