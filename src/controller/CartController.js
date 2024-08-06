import { ProductDTO } from '../dto/Product.DTO.js'
import { email } from '../helpers/email.js'
import { cartService } from '../repositories/CartService.js'
import { productService } from '../repositories/ProductService.js'
import { ticketService } from '../repositories/TicketService.js'

export class CartController{

    static addCart=async(req, res) => {

        try {
    
            const newCart = await cartService.addCart()
    
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                message: 'Carrito creado con éxito.',
                payload: newCart
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

    static getCart=async(req, res) => {

        let {cid} = req.params
    
        try {
    
            const data = await cartService.getCartById(cid)
    
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                message: 'Carrito obtenido con éxito.',
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

    static addProductToCart=async(req, res) => {

        const { cid, pid } = req.params
        const {user} = req

        try {

            if(user.cart._id === cid){
                let product = await productService.getProductBy({_id:pid})
                if(product.owner === user.email){
                    res.setHeader('Content-Type','application/json')
                    return res.status(403).json({
                        status: 'error',
                        error: 'Forbidden',
                        message:`Este producto ya le pertenece, no puede agregarlo al carrito.`
                    })
                }
        
                let cart = await cartService.getCartById(cid)
        
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
                    return res.status(409).json({
                        status: 'error',
                        error: 'Conflict',
                        message:`No es posible incrementar en más del stock.`
                    })
                }
        
                let data = await cartService.incQuantity(cid, pid)
                !data && (data = await cartService.addProductToCart(cid, { product: pid, quantity: 1 }))

                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'Producto agregado al carrito...!!!',
                    payload: data
                })

            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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

    static deleteProductToCart=async(req, res) => {

        const { cid, pid } = req.params
        const { user } = req

        try {

            if(user.cart._id === cid){

                let cart = await cartService.getCartById(cid)
                
                let productId = null
                cart.products.forEach(i => {
                    if(i.product._id.toString() === pid){
                        productId = i._id.toString() 
                    }
                })
        
                if(productId){
        
                    const data = await cartService.deleteProductToCart(cid, productId)
                    
                    res.setHeader('Content-Type','application/json')
                    return res.status(200).json({
                        status: 'success',
                        message: 'Producto eliminado del carrito.',
                        payload: data
                    })
                }else{
                    res.setHeader('Content-Type','application/json')
                    return res.status(404).json({
                        status: 'error',
                        error: 'Not Found',
                        message:`No existe un producto con id ${pid} en el carrito`
                    })
                }

            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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

    static deleteProductsToCart=async(req, res) => {

        const { cid } = req.params
        const {user} =req

        try {
            
            if(user.cart._id === cid){
                const data = await cartService.deleteProductsToCart(cid)
                    
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'Productos eliminados del carrito con éxito.',
                    payload: data
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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

    static updateQuantityToProduct=async(req, res) => {

        const { cid, pid } = req.params
        const { user } = req
        const { quantity } = req.body
    
        try {

            if(user.cart._id === cid){

                if(!quantity || quantity < 1){
                    res.setHeader('Content-Type','application/json')
                    return res.status(409).json({
                        status: 'error',
                        error: 'Conflict',
                        message:`Quantity debe ser mayor a 0.`
                    })
                }

                const prod = await productService.getProductBy({_id:pid})

                if(!prod || quantity > prod.stock){
                    res.setHeader('Content-Type','application/json')
                    return res.status(409).json({
                        status: 'error',
                        error: 'Conflict',
                        message:`Quantity debe ser menor o igual al stock disponible (${prod.stock}).`
                    })
                }

                const data = await cartService.updateQuantityToProduct(cid, pid, quantity)
        
                if(!data){
                    res.setHeader('Content-Type','application/json')
                    return res.status(404).json({
                        status: 'error',
                        error: 'Not Found',
                        message:`No existe un producto con id ${pid} en el carrito`
                    })
                }
                        
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: `La actualización de la cantidad en el producto con id ${pid} se realizó correctamente`,
                    payload: data
                })

            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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

    static updateCart=async(req, res) => {

        const { cid } = req.params
        const objetUpdate = req.body
        const {user} = req

        try {
            
            for (let i = 0; i < objetUpdate.products.length; i++) {
                let product = await productService.getProductBy({_id:objetUpdate.products[i].product})
                if(product.owner === user.email){
                    res.setHeader('Content-Type','application/json')
                    return res.status(403).json({
                        status: 'error',
                        error: 'Forbidden',
                        message:`El producto con id: ${objetUpdate.products[i].product} ya le pertenece, no puede agregarlo al carrito.`
                    })
                }
            }

            if(user.cart._id === cid){

                const data = await cartService.updateCart(cid, objetUpdate)
                
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'Carrito modificado con éxito.',
                    payload: data
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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

    static updateIncQuantityToProduct=async(req, res) => {

        const { cid, pid } = req.params
        const { user } = req

        try {
    
            if(user.cart._id === cid){

                let cart = await cartService.getCartById(cid)
        
                let quantityError = false
                cart.products.forEach(i => {
                    if(i.product._id == pid){
                        if(i.quantity >= i.product.stock ){
                            quantityError = true
                        }
                    }
                })
        
                if(quantityError){
                    res.setHeader('Content-Type','application/json')
                    return res.status(409).json({
                        status: 'error',
                        error: 'Conflict',
                        message:`No es posible incrementar el quantity en más del stock.`
                    })
                }
        
                const data = await cartService.incQuantity(cid, pid)
        
                if(!data){
                    res.setHeader('Content-Type','application/json')
                    return res.status(404).json({
                        status: 'error',
                        error: 'Not Found',
                        message:`No existe un producto con id ${pid} en el carrito`
                    })
                }
                        
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'Se incrementó el quantity en 1.',
                    payload: data
                })
            
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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

    static updateDecQuantityToProduct=async(req, res) => {

        const { cid, pid } = req.params
        const { user } = req

        try {
    
            if(user.cart._id === cid){

                let cart = await cartService.getCartById(cid)
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
                    return res.status(409).json({
                        status: 'error',
                        error: 'Conflict',
                        message:`No es posible decrementar el quantity en menos de 1.`
                    })
                }
        
                const data = await cartService.decQuantity(cid, pid)
        
                if(!data){
                    res.setHeader('Content-Type','application/json')
                    return res.status(404).json({
                        status: 'error',
                        error: 'Not Found',
                        message:`No existe un producto con id ${pid} en el carrito`
                    })
                }
                        
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'Se decrementó el quantity en 1.',
                    payload: data
                })
            
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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

    static purchaseCart = async (req, res) => {

        const { cid } = req.params
        const { user } = req

        let productsInStock = []
        let productsOutOfStock = []
        let newCart = []
        let amount = 0

        try {

            if(user.cart._id === cid){

                let {products} = await cartService.getCartById(cid)

                if(products.length === 0){
                    res.setHeader('Content-Type','application/json')
                    return res.status(400).json({
                        status: 'error',
                        error: 'Bad Request',
                        message: 'El carrito se encuentra vacío.',
                    }) 
                }

                for(const p of products){
                    if(p.product.stock >= p.quantity){
                        let newStock = p.product.stock - p.quantity

                            // Resta del stock las cantidades compradas en cada producto
                        await productService.updateProduct(p.product._id, {stock: newStock})
                        productsInStock.push(p)

                        amount += p.quantity * p.product.price
                        
                    }else{
                        productsOutOfStock.push(p)
                        newCart.push({product:p.product._id, quantity:p.quantity})
                    }
                }

                productsInStock=productsInStock.map(product=>new ProductDTO(product))
                productsOutOfStock=productsOutOfStock.map(product=>new ProductDTO(product))

                    //Genera ticket
                let newTicket = null
                if(productsInStock.length>0){
                    let code = user.cart._id+'-'+Math.random().toString(36).substring(2, 15).toUpperCase()
                    let purchaser = user.email
                    newTicket = await ticketService.createTicket({code, amount, purchaser})
                }

                    // Actualiza el carrito con los productos que no se pudieron comprar.
                await cartService.updateCart(cid, {products: newCart}) 

                    //genera cuerpo del email
                const htmlConten = () => {
                    let html = `
                            <p><b>Tickets de Compra:</b><p>
                            <p>Operación: ${newTicket.code}</p>
                            <p>Fecha y hora: ${newTicket.purchase_datetime}</p>
                            <p>Total de la compra: $${newTicket.amount}</p>
                            <p>Email: ${newTicket.purchaser}</p>
                            </br>
                            <p><strong>Productos comprados:</strong></p>
                            <ul>${productsInStock.map(p => `<li>${p.title} - Código: ${p.code} - Precio: $${p.price} - Cantidad: ${p.quantity} - Subtotal: $${p.subTotal}</li>`).join('')}</ul>`
                    return html
                }

                res.setHeader('Content-Type','application/json')

                if(productsInStock.length>0 && productsOutOfStock.length===0){

                    email(user.email, 'Überwinden - Ticket de compra', htmlConten())
                    return res.status(200).json({
                        status: 'success',
                        message: 'La compra se realizó con éxito.',
                        ticket: newTicket,
                        confirmed: productsInStock
                    })
                }

                if(productsInStock.length>0 && productsOutOfStock.length>0){

                    email(user.email, 'Überwinden - Ticket de compra', htmlConten())
                    return res.status(200).json({
                        status: 'partial_success',
                        message: 'La compra de algunos productos no se pudo concretar por falta de stock.',
                        ticket: newTicket,
                        confirmed: productsInStock,
                        rejected: productsOutOfStock
                    })
                }

                if(productsInStock.length===0 && productsOutOfStock.length>0){
                    return res.status(200).json({
                        status: 'fail',
                        message: 'La compra no se pudo concretar por falta de stock.',
                        rejected: productsOutOfStock
                    })
                }

            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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