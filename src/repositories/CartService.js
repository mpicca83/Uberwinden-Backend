import { CartManagerMongoDB as CartManager } from '../dao/CartManagerMongoDB.js'

class CartService{

    constructor(dao){
        this.dao=dao
    }

    addCart = async () => {
        return await this.dao.addCart()
    }

    getCartById = async (cid) => {
        return await this.dao.getCartById(cid)
    }

    addProductToCart = async (cid, objetUpdate) => {
        return await this.dao.addProductToCart(cid, objetUpdate)
    }

    incQuantity = async (cid, pid) => {
        return await this.dao.incQuantity(cid, pid)
    }

    decQuantity = async (cid, pid) => {
        return await this.dao.decQuantity(cid, pid)
    }

    deleteProductToCart = async (cid, productId) => {
        return await this.dao.deleteProductToCart(cid, productId)
    }

    deleteProductsToCart = async (cid) => {
        return await this.dao.deleteProductsToCart(cid)
    }

    updateQuantityToProduct = async (cid, pid, quantity) => {
        return await this.dao.updateQuantityToProduct(cid, pid, quantity)
    }

    updateCart = async (cid, objetUpdate) => {
        return await this.dao.updateCart(cid, objetUpdate)
    }

}

export const cartService = new CartService(new CartManager())