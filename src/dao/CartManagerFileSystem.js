import fs from 'fs'
import {join} from 'path'
import __dirname from '../utils.js'

export default class CartManagerFileSystem {

    #path
    
    constructor(){
        this.#path = join(__dirname, 'data', 'carrito.json')
    }

    async #leerArchivo(){
        try {
            if(fs.existsSync(this.#path)){

                const data = await fs.promises.readFile(this.#path, {encoding: 'utf-8'})
                
                if(data.trim() !== ''){
                    return JSON.parse(data)
                }
            } 
            return []
        } catch (error) {
            return ({error:`Hubo un error al leer el archivo. ${error.message}`})
        }
    }

    async #guardarArchivo(cart){
        try {
            await fs.promises.writeFile(this.#path, JSON.stringify(cart, null, 3))
        } catch (error) {
            return ({error:`Hubo un error al guardar el archivo. ${error.message}`})
        }
    }

    async addCart(){

        let carts = await this.#leerArchivo()

        const nuevoId = carts.length==0 ? 1 : Math.max(...carts.map(d=>d.id)) + 1
        
        const newCart = {
            id: nuevoId,
            products: []
        }

        carts.push(newCart)
        await this.#guardarArchivo(carts)
        return newCart
    }

    async getCartById(cid){

        const carts = await this.#leerArchivo()
        const existe = carts.find(p=>p.id == cid)

        if(existe){
            return existe.products
        }
    }

    async addProductToCart(cid, pid){

        let carts = await this.#leerArchivo()

        const cartIndex = carts.findIndex(cart => cart.id === cid)
        const productIndex = carts[cartIndex].products.findIndex(product => product.id === pid)

        if(productIndex === -1){
            carts[cartIndex].products.push({ id: pid, quantity: 1 })
        }else{
            carts[cartIndex].products[productIndex].quantity ++
        }

        await this.#guardarArchivo(carts)
        return carts[cartIndex].products
    }

}