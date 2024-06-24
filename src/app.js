import express from 'express'
import { router as productRouter } from './routes/productRouter.js'
import { router as cartRouter } from './routes/cartRouter.js'
import { router as viewsRouter } from './routes/viewsRouter.js'
import { router as sessionsRouter} from './routes/sessionsRouter.js'
import { join } from 'path'
import __dirname from './utils.js'
import { engine } from 'express-handlebars'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
//import sessions from "express-session"
//import MongoStore from 'connect-mongo'
import passport from 'passport'
import { initPassport } from './config/passport.config.js'
import cookieParser from 'cookie-parser'
import { config } from "./config/config.js"
import { messageService } from './repositories/MessageService.js'
import cors from 'cors'

const { PORT, MONGO_URL, DB_NAME } = config

const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(join(__dirname, 'public')))

    //Cors - Permite la solicitud cruzada entre servidores
app.use(cors()) 

    //Cookie-Parser
app.use(cookieParser())

    //Configuración de Sessions
// app.use(sessions({
//     secret: 'CoderCoder123',
//     resave:true,
//     saveUninitialized: true,
//     // Agrego configuración de connect-mongo
//     store: MongoStore.create({
//         ttl: 3600,
//         mongoUrl: 'mongodb+srv://mpicca83:CoderCoder@cluster0.tbrhmtv.mongodb.net/?retryWrites=true&w=majority',
//         dbName: 'ecommerce',
//         collectionName: 'sessions'
//     })
// }))

    //Configuración de Passport
initPassport()
app.use(passport.initialize())
//app.use(passport.session()) //Solo para usar con sessions

    //Configuración de Handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars') 
app.set('views', join(__dirname, 'views')) 

app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/', viewsRouter)

app.use((error, req, res, next) => {

    if(error){
        return res.status(500).json(
            {
                status: 'error',
                error:'Error inesperado en el servidor.',
                detail: `${error.message}`
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

        const message = await messageService.getMessages()

        socket.emit("mensajesPrevios", message)
        socket.broadcast.emit("nuevoUsuario", user)
    })

    socket.on("mensaje", async(user, message)=>{

        await messageService.addMessage({user, message})

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
            MONGO_URL,
            {
                dbName: DB_NAME
            }
        )
        console.log('DB Online...')
    } catch (error) {
        console.log('Error al conectar a DB.', error.message);
    }
}
connectDB()
