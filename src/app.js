import express from 'express'
import { router as productRouter } from './routes/productRouter.js'
import { router as cartRouter } from './routes/cartRouter.js'
import { router as vistasRouter } from './routes/vistasRouter.js'
import { join } from 'path'
import __dirname from './utils.js'
import { engine } from 'express-handlebars'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import MessageManagerMongoDB from './dao/MessageManagerMongoDB.js'

const messageManager = new MessageManagerMongoDB()

export const PORT=8080
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(join(__dirname, 'public')))

app.engine('handlebars', engine()) //Configuración de Handlebars
app.set('view engine', 'handlebars') //Configuración de Handlebars
app.set('views', join(__dirname, 'views')) //Configuración de Handlebars

app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/', vistasRouter)

app.use((error, req, res, next) => {

    if(error){
        return res.status(500).json(
            {
                error:'Error inesperado en el servidor.',
                detalle: `${error.message}`
            }
        )
    }
    next()
})

const server = app.listen(PORT, ()=> console.log(`Server online en puerto ${PORT}`))

export const io = new Server(server)

// Chat

let users=[]
 
io.on("connection", socket=>{
    console.log(`Se ha conectado un cliente con id ${socket.id}`)

    socket.on("id", async(user)=>{

        users.push({id:socket.id, user})

        const message = await messageManager.getMessages()

        socket.emit("mensajesPrevios", message)
        socket.broadcast.emit("nuevoUsuario", user)
    })

    socket.on("mensaje", async(user, message)=>{

        await messageManager.addMessage({user, message})

        io.emit("nuevoMensaje", user, message)
    })

    socket.on("disconnect", ()=>{
        let user = users.find(u => u.id === socket.id)
        if(user){
            io.emit("saleUsuario", user.user)
        }
    })
})

// Configuración para la conexión de mongoose con Atlas
const connectDB = async () => {
    try {
        await mongoose.connect(
            'mongodb+srv://mpicca83:CoderCoder@cluster0.tbrhmtv.mongodb.net/?retryWrites=true&w=majority',
            {
                dbName: 'ecommerce'
            }
        )
        console.log('DB Online...')
    } catch (error) {
        console.log('Error al conectar a DB.', error.message);
    }
}
connectDB()
