import { productsModel } from './models/productsModel.js'

export default class ProductManagerMongoDB {

    async addProduct(product){

        return await productsModel.create(product)
    }

    async getProducts(){

        return await productsModel.find().lean()
    }

    async getProductBy(filtro){

        return await productsModel.findOne(filtro)
    }

    async updateProduct(id, objetUpdate){

        return await productsModel.findByIdAndUpdate(id, objetUpdate, {runValidators: true, returnDocument: "after"})
    }

    async deleteProduct(id){

        return await productsModel.deleteOne({_id: id})
    }
}