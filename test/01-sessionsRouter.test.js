import { expect } from 'chai'
import supertest from 'supertest'
import mongoose, { isValidObjectId } from "mongoose"
import { config } from "../src/config/config.js"

const { EMAIL_ADMIN, PASSWORD_ADMIN, MONGO_URL, DB_NAME  } = config

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

export let idUser
export let cartUser
export let tokenUser
export let tokenAdmin

describe("Proyecto Ecommerce:", function(){
    this.timeout(10000)

    describe('Testing de las rutas referidas a usuarios.', () => {

        before(async () => {

            await mongoose.connection.collection("users").deleteMany({email:"user@test.com"})

            const resAdmin = await request.post('/api/sessions/login')
            .send({
                email: EMAIL_ADMIN,
                password: PASSWORD_ADMIN,
            })

            tokenAdmin = resAdmin.body.token
        })

        describe('Crear un nuevo usuario. Ruta: /api/sessions/register Metodo: post', () => {

            it('Crea un usuario válido', async () => {
                const res = await request.post('/api/sessions/register')
                .send({
                    first_name: 'UserTest',
                    email: 'user@test.com',
                    password: 'TEST123',
                })

                expect(res.status).to.equal(201)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.user).to.have.property('_id')
                expect(isValidObjectId(res.body.user._id)).to.be.true
            })

            it('Intenta crear un usuario con un email que ya se encuentre registrado. Retorna un error Conflict de status 409', async () => {
                const res = await request.post('/api/sessions/register')
                .send({
                    first_name: 'UserTest',
                    email: 'user@test.com',
                    password: 'TEST123',
                })

                expect(res.status).to.equal(409)
                expect(res.body).to.have.property('error', 'Conflict')
            })

            it('Intenta crear un usuario sin el nombre el cual es requerido. Retorna un error Bad Request de status 400', async () => {
                const res = await request.post('/api/sessions/register')
                .send({
                    email: 'user@test.com',
                    password: 'TEST123',
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })
        })

        describe('Iniciar sesión. Ruta: /api/sessions/login Metodo: post', () => {

            it('Inicia una sesión válida', async () => {
                const res = await request.post('/api/sessions/login')
                .send({
                    email: 'user@test.com',
                    password: 'TEST123',
                })

                expect(res.status).to.equal(200)
                expect(res.body).to.have.property('status', 'success')
                expect(res.body.user).to.have.property('_id')
                expect(isValidObjectId(res.body.user._id)).to.be.true

                cartUser = res.body.user.cart._id
                idUser = res.body.user._id
                tokenUser = res.body.token
            })

            it('Intenta iniciar sesión con un email no registrado. Retorna un error Not Found de status 404', async () => {
                const res = await request.post('/api/sessions/login')
                .send({
                    email: 'xxx@test.com',
                    password: 'TEST123',
                })

                expect(res.status).to.equal(404)
                expect(res.body).to.have.property('error', 'Not Found')
            })

            it('Intenta iniciar sesión con una contraseña incorrecta. Retorna un error Unauthorized de status 401', async () => {
                const res = await request.post('/api/sessions/login')
                .send({
                    email: 'user@test.com',
                    password: 'xxxxxx',
                })

                expect(res.status).to.equal(401)
                expect(res.body).to.have.property('error', 'Unauthorized')
            })

            it('Intenta iniciar sesión sin el dato de email o password. Retorna un error Bad Request de status 400', async () => {
                const res = await request.post('/api/sessions/login')
                .send({
                    email: 'user@test.com'
                })

                expect(res.status).to.equal(400)
                expect(res.body).to.have.property('error', 'Bad Request')
            })

        })

        after(async () => {
        })
    })
})
