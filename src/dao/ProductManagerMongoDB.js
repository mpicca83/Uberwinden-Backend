import { productsModel } from './models/productsModel.js'

export class ProductManagerMongoDB {

    async addProduct(product){
        
        return await productsModel.create(product)
    }

    async getProducts(limit=10, page=1, sort, query){
        
        return await productsModel.paginate(query, {lean: true, limit, page, sort})
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