import express from 'express'
import { router as productRouter } from './routes/productRouter.js'
import { router as cartRouter } from './routes/cartRouter.js'
import { router as vistasRouter } from './routes/vistasRouter.js'
import { join } from 'path'
import __dirname from './utils.js'
import { engine } from 'express-handlebars'
import { Server } from 'socket.io'

const PORT=8080
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
