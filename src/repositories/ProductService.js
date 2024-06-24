import { ProductManagerMongoDB as ProductManager } from '../dao/ProductManagerMongoDB.js'

class ProductService {

    constructor(dao){
        this.dao=dao
    }

    addProduct = async (product) => {
        return await this.dao.addProduct(product)
    }

    getProducts = async (limit=10, page=1, sort, query) => {
        return await this.dao.getProducts(limit, page, sort, query)
    }

    getProductBy = async (filtro) => {
        return await this.dao.getProductBy(filtro)
    }

    updateProduct = async (id, objetUpdate) => {
        return await this.dao.updateProduct(id, objetUpdate)
    }

    deleteProduct = async (id) => {
        return await this.dao.deleteProduct(id)
    }
}

export const productService = new ProductService(new ProductManager())