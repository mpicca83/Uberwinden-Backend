import mongoose from "mongoose"

const cartsCollection = 'carts'
const cartsSchema = new mongoose.Schema(
    {
        products: [{ 
            product: {
                type:mongoose.Types.ObjectId,
                ref: 'products'
            },
            quantity: {type: Number, required: true, min: 1}
        }]
    },
    {
        timestamps: true
    }
)

cartsSchema.pre('findOne', function(){
    this.populate({
        path: 'products.product'
    }).lean()
})

export const cartsModel = mongoose.model(cartsCollection, cartsSchema)