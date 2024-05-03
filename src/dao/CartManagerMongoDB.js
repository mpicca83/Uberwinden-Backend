import { cartsModel } from './models/cartsModel.js'

export default class CartManagerMongoDB {

    async addCart(){

        return await cartsModel.create({products:[]})
    }

    async getCartById(cid){

        return await cartsModel.findById(cid)
    }

    async addProductToCart(cid, objetUpdate){

        return await cartsModel.findByIdAndUpdate(cid, objetUpdate, {runValidators: true, returnDocument: "after"})
    }
}