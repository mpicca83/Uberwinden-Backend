import { cartsModel } from './models/cartsModel.js'

export default class CartManagerMongoDB {

    async addCart(){

        return await cartsModel.create({products:[]})
    }

    async getCartById(cid){

        return await cartsModel.findById(cid)
    }

    async addProductToCart(cid, objetUpdate){

        return await cartsModel.findOneAndUpdate(
            { _id:cid }, 
            { $push: {products: objetUpdate}},
            { new: true }
        )
    }

    async incQuantity(cid, pid){
        return await cartsModel.findOneAndUpdate(
            { _id:cid, 'products.product': pid}, 
            { $inc: { 'products.$.quantity': 1 }},
            { new: true }
        )
    }

    async decQuantity(cid, pid){

        return await cartsModel.findOneAndUpdate(
            { _id:cid, 'products.product': pid }, 
            { $inc: { 'products.$.quantity': -1 }},
            { new: true }
        )
    }

    async deleteProductToCart(cid, productId){

        return await cartsModel.findOneAndUpdate(
            { _id:cid }, 
            { $pull: {products:{_id:productId}}},
            { new: true }
        )
    }

    async deleteProductsToCart(cid){
        
        return await cartsModel.findByIdAndUpdate(
            cid,
            {products:[]},
            {runValidators: true, returnDocument: "after"}
        )
    }

    async updateQuantityToProduct(cid, pid, quantity){

        return await cartsModel.findOneAndUpdate(
            { _id: cid, 'products.product': pid },
            { $set: { 'products.$.quantity': quantity } },
            { new: true }
        );
    }

    async updateCart(cid, objetUpdate){

        return await cartsModel.findByIdAndUpdate(
            cid,
            objetUpdate,
            {runValidators: true, returnDocument: "after"}
        )
    }








}