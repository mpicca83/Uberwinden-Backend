import { expect } from 'chai'
import supertest from 'supertest'
import mongoose, { isValidObjectId } from "mongoose"
import { idUser, cartUser, tokenUser, tokenAdmin } from './01-sessionsRouter.test.js'
import { config } from "../src/config/config.js"

const { MONGO_URL, DB_NAME } = config

const request = supertest("http://localhost:8080")

const connectDB = async () => {
    try {
        await mongoose.connect(
            MONGO_URL,
            {
                dbName: DB_NAME
            }
        )
    } catch (error) {
        console.log('Error al conectar a DB.', error.message)
    }
}
connectDB()

let productId1
let productId2

describe("Proyecto Ecommerce:", function(){
    this.timeout(10000)

    describe('Testing de las rutas referidas al carrito.', () => {

        before(async () => {
            const res1 = await request.post('/api/products')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                title: 'Titilo del producto 1',
                description: 'Descripción del producto 1',
                code: 'TEST123',
                price: 100,
                stock: 10,
                category: 'test'
            })
            productId1 = res1.body.payload._id

            const res2 = await request.post('/api/products')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                title: 'Titilo del producto 2',
                description: 'Descripción del producto 2',
                code: 'TEST456',
                price: 100,
                stock: 1,
                category: 'test'
            })
            productId2 = res2.body.payload._id
        })

        describe('Agrega un producto al carrito. Ruta: /api/carts/:cid/product/:pid Metodo: post', () => {

            it('Agregar un producto al carrito', async () => {
                const res = await request.post(`/api/carts/${cartUser}/product/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload.products[0]).to.have.property('quantity')
                expect(isValidObjectId(res.body.payload.products[0]._id)).to.be.true
            })

            it('Intenta agregar un producto inexistente al carrito. Retorna un error Not Found de status 404', async () => {
                const res = await request.post(`/api/carts/${cartUser}/product/66aa57bb055a142b9399340c`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })

            it('Intenta agregar un producto a un carrito inexistente. Retorna un error Not Found de status 404', async () => {
                const res = await request.post(`/api/carts/66aa57bb055a142b9399340c/product/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })

            it('Intenta agregar un producto con un id no válido al carrito. Retorna un error Bad Request de status 400', async () => {
                const res = await request.post(`/api/carts/${cartUser}/product/xxxxxx`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta agregar un producto al carrito con id no válido. Retorna un error Bad Request de status 400', async () => {
                const res = await request.post(`/api/carts/xxxxxx/product/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta agregar un producto al carrito con un usuario no autorizado. Retorna un error Forbidden de status 403', async () => {
                const res = await request.post(`/api/carts/${cartUser}/product/${productId1}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)

                expect(res.status).to.equal(403)
                expect(res.body).to.have.property('error', 'Forbidden')
            })

            it('Intenta agregar un producto al carrito sin un token de autorización. Retorna un error Unauthorized de status 401', async () => {
                const res = await request.post(`/api/carts/${cartUser}/product/${productId1}`)

                expect(res.status).to.equal(401)
                expect(res.body).to.have.property('error', 'Unauthorized')
            })

        })

        describe('Modifica la cantidad de un producto en el carrito. Ruta: /api/carts/:cid/products/:pid Metodo: put', () => {

            it('Modifica la cantidad de un producto en el carrito', async () => {
                const res = await request.put(`/api/carts/${cartUser}/products/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    quantity: 5
                })

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload.products[0]).to.have.property('quantity')
                expect(isValidObjectId(res.body.payload.products[0]._id)).to.be.true
            })

            it('Intenta modificar un producto en el carrito con quantity 0. Retorna un error Conflict de status 409', async () => {
                const res = await request.put(`/api/carts/${cartUser}/products/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    quantity: 0
                })

                expect(res.status).to.equal(409)
                expect(res.body).to.have.property('error', 'Conflict')
            })

            it('Intenta modificar un producto en el carrito con quantity mayor al stock disponible. Retorna un error Conflict de status 409', async () => {
                const res = await request.put(`/api/carts/${cartUser}/products/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    quantity: 1000000
                })

                expect(res.status).to.equal(409)
                expect(res.body).to.have.property('error', 'Conflict')
            })

            it('Intenta modificar la cantidad de un producto no existente en el carrito. Retorna un error Not Found de status 404', async () => {
                const res = await request.put(`/api/carts/${cartUser}/products/6634261073e91c0cf32a3ffa`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    quantity: 2
                })

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })
        })

        describe('Modifica los datos de un carrito. Ruta: /api/carts/:cid Metodo: put', () => {

            it('Modifica los datos de un carrito.', async () => {
                const res = await request.put(`/api/carts/${cartUser}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    "products": [
                        {
                            "product": `${productId2}`,
                            "quantity": 1
                        },
                        {
                            "product": `${productId1}`,
                            "quantity": 4
                        }
                    ]
                })

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload.products[1]).to.have.property('quantity')
                expect(res.body.payload.products[0].quantity).to.equal(1)
                expect(res.body.payload.products[1].quantity).to.equal(4)
                expect(isValidObjectId(res.body.payload.products[1]._id)).to.be.true
            })

            it('Intenta modificar los datos de un carrito enviando 1 objeto sin el array "products". Retorna un error Bad Request de status 400', async () => {
                const res = await request.put(`/api/carts/${cartUser}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    "product": `${productId2}`,
                    "quantity": 1
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta modificar los datos de un carrito sin la propiedad product o quantity. Retorna un error Bad Request de status 400', async () => {
                const res = await request.put(`/api/carts/${cartUser}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    "products": [
                        {
                            "product": `${productId2}`
                        },
                        {
                            "quantity": 4
                        }
                    ]
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta modificar los datos de un carrito con 2 objetos que contienen el mismo product. Retorna un error Bad Request de status 400', async () => {
                const res = await request.put(`/api/carts/${cartUser}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    "products": [
                        {
                            "product": `${productId2}`,
                            "quantity": 1
                        },
                        {
                            "product": `${productId2}`,
                            "quantity": 4
                        }
                    ]
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta modificar los datos de un carrito con una cantidad mayor al stock disponible. Retorna un error Bad Request de status 400', async () => {
                const res = await request.put(`/api/carts/${cartUser}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    "products": [
                        {
                            "product": `${productId2}`,
                            "quantity": 20
                        }
                    ]
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

        })

        describe('Incrementa en 1 la cantidad de un producto en el carrito. Ruta: /api/carts/incQuantity/:cid/products/:pid Metodo: put', () => {

            it('Incrementa en 1 la cantidad de un producto en el carrito', async () => {
                const res = await request.put(`/api/carts/incQuantity/${cartUser}/products/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload.products[1]).to.have.property('quantity')
                expect(res.body.payload.products[1].quantity).to.not.equal(1)
                expect(isValidObjectId(res.body.payload.products[1]._id)).to.be.true
            })
            
            it('Intenta incrementar la cantidad de un producto en el carrito en mas del stock disponible. Retorna un error Conflict de status 409', async () => {
                const res = await request.put(`/api/carts/incQuantity/${cartUser}/products/${productId2}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(409)
                expect(res.body).to.have.property('error', 'Conflict')
            })

            it('Intenta incrementar la cantidad de un producto no existente en el carrito. Retorna un error Not Found de status 404', async () => {
                const res = await request.put(`/api/carts/incQuantity/${cartUser}/products/6634261073e91c0cf32a3ffa`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })
        })

        describe('Decrementa en 1 la cantidad de un producto en el carrito. Ruta: /api/carts/incQuantity/:cid/products/:pid Metodo: put', async () => {

            it('Decrementa en 1 la cantidad de un producto en el carrito', async () => {
                const res = await request.put(`/api/carts/decQuantity/${cartUser}/products/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload.products[1]).to.have.property('quantity')
                expect(res.body.payload.products[1].quantity).to.not.equal(0)
                expect(isValidObjectId(res.body.payload.products[1]._id)).to.be.true
            })
            
            it('Intenta decrementar la cantidad de un producto en el carrito en menos de 1. Retorna un error Conflict de status 409', async () => {
                const res = await request.put(`/api/carts/decQuantity/${cartUser}/products/${productId2}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(409)
                expect(res.body).to.have.property('error', 'Conflict')
            })

            it('Intenta decrementar la cantidad de un producto no existente en el carrito. Retorna un error Not Found de status 404', async () => {
                const res = await request.put(`/api/carts/decQuantity/${cartUser}/products/6634261073e91c0cf32a3ffa`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })
        })

        describe('Visualiza un carrito según si ID. Ruta: /api/carts/:cid Metodo: get', () => {

            it('Visualiza un carrito según si ID', async () => {
                const res = await request.get(`/api/carts/${cartUser}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload.products[0]).to.have.property('quantity')
                expect(res.body.payload.products[1].quantity).to.not.equal(1)
                expect(isValidObjectId(res.body.payload.products[1]._id)).to.be.true
            })
        })

        describe('Elimina un producto del carrito. Ruta: /api/carts/:cid/products/:pid Metodo: delete', () => {

            it('Elimina un producto del carrito.', async () => {
                const res = await request.delete(`/api/carts/${cartUser}/products/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload.products).to.have.lengthOf(1);

            })
        })

        describe('Elimina todos los productos de un carrito. Ruta: /api/carts/:cid Metodo: delete', () => {

            it('Elimina un producto del carrito.', async () => {
                const res = await request.delete(`/api/carts/${cartUser}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload.products).to.have.lengthOf(0);

            })
        })

        describe('Realiza la compra de un carrito. Ruta: /api/carts/:cid/purchase Metodo: post', () => {

            before(async () => {
                await request.post(`/api/carts/${cartUser}/product/${productId1}`)
                .set('Authorization', `Bearer ${tokenUser}`)
            })
            
            it('Realiza la compra de un carrito', async () => {
                const res = await request.post(`/api/carts/${cartUser}/purchase`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body).to.have.property('ticket')
                expect(res.body).to.have.property('confirmed')
                expect(isValidObjectId(res.body.confirmed[0].id)).to.be.true
            })

            it('Intenta realiza la compra de un carrito vacío', async () => {
                const res = await request.post(`/api/carts/${cartUser}/purchase`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })
        })

        after(async () => {
            await request.delete(`/api/products/${productId1}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            await request.delete(`/api/products/${productId2}`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            await mongoose.connection.collection("users").deleteMany({email:"user@test.com"})
            await mongoose.connection.collection("tickets").deleteMany({purchaser:"user@test.com"})
        })

    })
})

    
