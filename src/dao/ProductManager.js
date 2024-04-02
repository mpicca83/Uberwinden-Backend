import fs from 'fs'
import {join} from 'path'
import __dirname from '../utils.js'

export default class ProductManager {

    #path
    
    constructor(){
        this.#path = join(__dirname, 'data', 'productos.json')
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

    async #guardarArchivo(products){
        try {
            await fs.promises.writeFile(this.#path, JSON.stringify(products, null, 3))
        } catch (error) {
            return ({error:`Hubo un error al guardar el archivo. ${error.message}`})
        }
    }

    async addProduct(product){

        let products = await this.#leerArchivo()

        const {code} = product

        if (products.some(p=>p.code == code))
            return ({error:`El code ${code} ya se encuentra registrado`})
        
        const nuevoId = products.length==0 ? 1 : Math.max(...products.map(d=>d.id)) + 1
        
        const newProduct = {
            id: nuevoId,
            ...product
        }

        products.push(newProduct)
        await this.#guardarArchivo(products)
        return newProduct
    }

    async getProducts(){

        const products = await this.#leerArchivo()
    
        if(products.length > 0){
            return products
        } else{
            return []
        }
    }

    async getProductById(id){

        const products = await this.#leerArchivo()
        const existe = products.find(p=>p.id == id)

        if(existe){
            return existe
        }
    }

    async updateProduct(idNumber, objetUpdate={}){

            let products = await this.#leerArchivo()
            const index = products.findIndex(product => product.id === idNumber)
            
            const {code} = objetUpdate
            if (products.some(p=>p.code == code))
                return ({error:`El code ${code} ya se encuentra registrado`})

            if(index !== -1){
                products[index] = {...products[index], ...objetUpdate}
                await this.#guardarArchivo(products)
                return products[index]
            } 
    }

    async deleteProduct(id){

        let products = await this.#leerArchivo()
        const index = products.some(p => p.id === id)

        if(index){
            products = products.filter(p => p.id !== id)
            await this.#guardarArchivo(products)
            return ({success:`El producto con el Id ${id} se eliminó correctamente.`})
        } 
    }
}