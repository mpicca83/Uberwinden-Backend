import express from 'express'
import { router as productRouter} from './routes/productRouter.js'
import { router as cartRouter} from './routes/cartRouter.js'


const PORT=8080
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/api/products', productRouter)
app.use('/api/carts', cartRouter)

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ error: 'Error en el análisis JSON - Verifica el formato del cuerpo de la solicitud' })
    }
    next()
})

const server = app.listen(PORT, ()=> console.log(`Server online en puerto ${PORT}`))