import mongoose from "mongoose"

const cartsCollection = 'carts'
const cartsSchema = new mongoose.Schema(
    {
        products: [{ 
            productId: {type: String, required: true},
            quantity: {type: Number, required: true, min: 0}
        }]
    },
    {
        timestamps: true
    }
)

export const cartsModel = mongoose.model(cartsCollection, cartsSchema)