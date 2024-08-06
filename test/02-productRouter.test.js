import { expect } from 'chai'
import supertest from 'supertest'
import { isValidObjectId } from "mongoose"
import { tokenUser, tokenAdmin } from './01-sessionsRouter.test.js'

const request = supertest("http://localhost:8080")

let productId

describe("Proyecto Ecommerce:", function(){
    this.timeout(10000)

    describe('Testing de las rutas referidas a productos.', () => {

        before(async () => {
        })

        describe('Crea un nuevo producto. Ruta: /api/products/ Metodo: post', () => {

            it('Crea un producto válido', async () => {
                const res = await request.post('/api/products')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    title: 'Titilo del producto',
                    description: 'Descripción del producto',
                    code: 'TEST123',
                    price: 100,
                    stock: 10,
                    category: 'test'
                })

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload).to.have.property('_id')
                expect(isValidObjectId(res.body.payload._id)).to.be.true

                productId = res.body.payload._id
            })

            it('Intenta crear un producto con una propiedad "code" ya existente en la base de datos. Retorna un error Conflict de status 409', async () => {
                const res = await request.post('/api/products')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    title: 'Titilo del producto',
                    description: 'Descripción del producto',
                    code: 'TEST123',
                    price: 100,
                    stock: 10,
                    category: 'test'
                })

                expect(res.status).to.equal(409)
                expect(res.body).to.have.property('error', 'Conflict')
            })

            it('Intenta crear un producto sin la propiedad "title" la cual es requerida. Retorna un error Bad Request de status 400', async () => {
                const res = await request.post('/api/products')
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    description: 'Descripción del producto',
                    code: 'TEST123',
                    price: 100,
                    stock: 10,
                    category: 'test'
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta crea un producto con un usuario no autorizado. Retorna un error Forbidden de status 403', async () => {
                const res = await request.post('/api/products')
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    description: 'Descripción del producto',
                    code: 'TEST123',
                    price: 100,
                    stock: 10,
                    category: 'test'
                })

                expect(res.status).to.equal(403)
                expect(res.body).to.have.property('error', 'Forbidden')
            })
        })

        describe('Modifica un producto. Ruta: /api/products/:pid Metodo: put', () => {

            it('Modifica un producto', async () => {
                const res = await request.put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    stock: 5,
                })

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload).to.have.property('_id')
                expect(isValidObjectId(res.body.payload._id)).to.be.true

            })

            it('Intenta modificar una propiedad no válida como el _id. Retorna un error Bad Request de status 400', async () => {
                const res = await request.put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    _id: 'xxxxx'
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta modificar un producto que no existe en la BD. Retorna un error Not Found de status 404', async () => {
                const res = await request.put(`/api/products/669ecad9cc02ac32ca96ecbf`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    stock: 5,
                })

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })

            it('Intenta modificar un producto con un ID no válido. Retorna un error Bad Request de status 400', async () => {
                const res = await request.put(`/api/products/xxx`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    stock: 5,
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta modificar un producto con un usuario no autorizado. Retorna un error Forbidden de status 403', async () => {
                const res = await request.put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${tokenUser}`)
                .send({
                    stock: 5,
                })

                expect(res.status).to.equal(403)
                expect(res.body).to.have.property('error', 'Forbidden')
            })

            it('Intenta modificar un producto con un código ya existente. Retorna un error Conflict de status 409', async () => {
                const res = await request.put(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .send({
                    code: 'TEST123'
                })

                expect(res.status).to.equal(409)
                expect(res.body).to.have.property('error', 'Conflict')
            })
        })

        describe('Visualizar todos los productos. Ruta: /api/products/ Metodo: get', () => {

            it('Visualizar todos los productos.', async () => {
                const res = await request.get(`/api/products/`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload[0]).to.have.property('_id')
                expect(isValidObjectId(res.body.payload[0]._id)).to.be.true
                expect(res.body.payload).to.be.an('array')
                expect(res.body).to.have.property('totalPages')
                expect(res.body).to.have.property('prevLink')

            })
        })

        describe('Visualizar un producto según su ID. Ruta: /api/products/:pid Metodo: get', () => {

            it('Visualizar un producto.', async () => {
                const res = await request.get(`/api/products/${productId}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.payload).to.have.property('_id')
            })

            it('Intenta visualizar un producto cuyo ID no existe en la BD. Retorna un error Not Found de status 404', async () => {
                const res = await request.get(`/api/products/665fb2ff3c2014fcb5e53014`)

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })

            it('Intenta visualizar un producto con un ID no válido. Retorna un error Bad Request de status 400', async () => {
                const res = await request.get(`/api/products/xxxxxx`)

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })
        })

        describe('Eliminar un producto según su ID. Ruta: /api/products/:pid Metodo: delete', () => {

            it('Intenta eliminar un producto cuyo ID no existe en la BD. Retorna un error Not Found de status 404', async () => {
                const res = await request.delete(`/api/products/665fb2ff3c2014fcb5e53014`)
                .set('Authorization', `Bearer ${tokenAdmin}`)

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })

            it('Intenta eliminar un producto con un ID no válido. Retorna un error Bad Request de status 400', async () => {
                const res = await request.delete(`/api/products/xxxxxx`)
                .set('Authorization', `Bearer ${tokenAdmin}`)

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

            it('Intenta eliminar un producto con un usuario no autorizado. Retorna un error Forbidden de status 403', async () => {
                const res = await request.delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${tokenUser}`)

                expect(res.status).to.equal(403)
                expect(res.body).to.have.property('error', 'Forbidden')
            })


            it('Eliminar un producto.', async () => {
                const res = await request.delete(`/api/products/${productId}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
            })
        })

        after(async () => {
        })
    })
})
