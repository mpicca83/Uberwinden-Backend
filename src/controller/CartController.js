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
                payload: newCart
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

    static getCart=async(req, res) => {

        let {cid} = req.params
    
        try {
    
            const data = await cartService.getCartById(cid)
    
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'seccess',
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

    static addProductToCart=async(req, res) => {

        const { cid, pid } = req.params
        const {user} = req

        try {

            let product = await productService.getProductBy({_id:pid})
            if(product.owner === user.email){
                res.setHeader('Content-Type','application/json')
                return res.status(404).json({
                    status: 'error',
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
                return res.status(404).json({
                    status: 'error',
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
    
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                    detail:`${error.message}`
                }
            )
        }
    }

    static deleteProductToCart=async(req, res) => {

        const { cid, pid } = req.params
    
        try {
    
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
                    message: 'Producto eliminado.',
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

    static deleteProductsToCart=async(req, res) => {

        const { cid } = req.params
    
        try {
            
            const data = await cartService.deleteProductsToCart(cid)
                
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

    static updateQuantityToProduct=async(req, res) => {

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
    
            const data = await cartService.updateQuantityToProduct(cid, pid, quantity)
    
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

    static updateCart=async(req, res) => {

        const { cid } = req.params
        const objetUpdate = req.body
        const {user} = req

        try {
            
            for (let i = 0; i < objetUpdate.products.length; i++) {
                let product = await productService.getProductBy({_id:objetUpdate.products[i].product})
                if(product.owner === user.email){
                    res.setHeader('Content-Type','application/json')
                    return res.status(404).json({
                        status: 'error',
                        message:`El producto con id: ${objetUpdate.products[i].product} ya le pertenece, no puede agregarlo al carrito.`
                    })
                }
            }

            const data = await cartService.updateCart(cid, objetUpdate)
                
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

    static updateIncQuantityToProduct=async(req, res) => {

        const { cid, pid } = req.params
    
        try {
    
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
                return res.status(404).json({
                    status: 'error',
                    error:`No es posible incrementar el quantity en más del stock.`
                })
            }
    
            const data = await cartService.incQuantity(cid, pid)
    
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

    static updateDecQuantityToProduct=async(req, res) => {

        const { cid, pid } = req.params
    
        try {
    
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
                return res.status(404).json({
                    status: 'error',
                    error:`No es posible decrementar el quantity en menos de 1.`
                })
            }
    
            const data = await cartService.decQuantity(cid, pid)
    
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

    static purchaseCart = async (req, res) => {

        const { cid } = req.params
        const { user } = req

        let productsInStock = []
        let productsOutOfStock = []
        let newCart = []
        let amount = 0

        try {

            let {products} = await cartService.getCartById(cid)

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