import { io } from '../app.js'
import { config } from '../config/config.js'
import { productService } from '../repositories/ProductService.js'
import { email as sendEmail } from '../helpers/email.js'


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
                message: 'Productos obtenidos con éxito.',
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
                    error: 'Internal Server Error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
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
                message:'Producto obtenido con éxito.',
                payload: data
            }) 
    
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error: 'Internal Server Error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
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
                return res.status(409).json({
                    status: 'error',
                    error: 'Conflict',
                    message:`El code ${code} ya se encuentra registrado`
                })
            }
    
            const newProduct = await productService.addProduct(product)
            io.emit('productAdd',  newProduct )
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                message: 'El producto se ha creado con éxito.',
                payload: newProduct,
            })
    
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error: 'Internal Server Error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
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
                    return res.status(409).json({
                        status: 'error',
                        error: 'Conflict',
                        message:`El code ${objetUpdate.code} ya se encuentra registrado`
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
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.'
                })
            }
    
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error: 'Internal Server Error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                }
            )
        }
    }

    static deleteProduct=async(req, res) => {

        const {pid} = req.params
        const {user} = req

    
        try {
            
            const product = await productService.getProductBy({_id:pid})

            const htmlContent = () => {
                let html = `
                    <p>Estimado usuario,</p>
                    <p>Le informamos que su producto <strong>${product.title}</strong> con código <strong>${product.code}</strong> ha sido eliminado de nuestra plataforma.</p>
                    <p>Si considera que esto es un error o desea obtener más información, por favor póngase en contacto con nuestro equipo de soporte.</p>
                    <br/>
                    <p>Atentamente,</p>
                    <p>El equipo de Überwinden-Ecommerce</p>
                `
                return html
            }
    
            if(user.rol === 'admin' || (user.rol === 'premium' && user.email === product.owner)){
                
                await productService.deleteProduct(pid)

                product.owner !== 'admin' && sendEmail(product.owner, 'Überwinden-Ecommerce: Notificación de Eliminación de Producto', htmlContent())

                const products = await productService.getProducts()
                io.emit('productsAll', { products })
        
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message:`Producto con id ${pid} eliminado correctamente.`
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.'
                })
            }
             
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error: 'Internal Server Error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                }
            )
        }
    }

}