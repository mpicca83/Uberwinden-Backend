import { check, validationResult } from 'express-validator'
import { productService } from '../repositories/ProductService.js'

export const validateCart = [
    check('products')
        .notEmpty().withMessage('El campo "products" es requerido.')
        .isArray().withMessage('Products debe ser un array de objetos.'),

    check('products.*.product')
        .notEmpty().withMessage('El campo "product" en cada elemento de "products" es requerido.')
        .isMongoId().withMessage('El campo "product" debe ser un ID de Mongo válido.')
        .custom(async (value, { req }) => {
            // Obtener los valores únicos de 'product' dentro del array
            const uniqueProducts = new Set(req.body.products.map(item => item.product))
            // Verificar si el número de valores únicos es igual al número de elementos en el array
            if (uniqueProducts.size !== req.body.products.length) {
                throw new Error('Los valores del campo "product" deben ser únicos.')
            } 
            for (const item of req.body.products) {
                let valido = await productService.getProductBy({ _id: item.product })
                if (!valido) {
                    throw new Error(`El elemento product:${item.product} no corresponde a un producto existente.`)
                }
            }
            return true
        }),

    check('products.*.quantity')
        .notEmpty().withMessage('El campo "quantity" en cada elemento de "products" es requerido.')
        .isNumeric().withMessage('El campo "quantity" debe ser numérico.')
        .toInt()
        .custom(async (value, { req }) => {
            if (value < 1) {
                throw new Error('El campo "quantity" debe ser un número mayor que 0.')
            }
            for (const item of req.body.products) {
                let product = await productService.getProductBy({ _id: item.product })
                if (item.quantity>product.stock) {
                    throw new Error(`El stock del product:${item.product} no es suficiente.`)
                }
            }

            return true
        }),

    (req, res, next) => {
        try {
            validationResult(req).throw()
            return next()
        } catch (error) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Bad Request',
                message: error.array() 
            })
        }
    }
]