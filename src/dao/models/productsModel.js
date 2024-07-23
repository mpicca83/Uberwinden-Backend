import mongoose from "mongoose"
import paginate from "mongoose-paginate-v2"

const productsCollection = 'products'
const productsSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        description: {type: String, required: true},
        code: {type: String, required: true, unique: true},
        price: {type: Number, required: true},
        status: {type: Boolean , required: true},
        stock: {type: Number, required: true, min: 0},
        category: {type: String, required: true},
        thumbnails: [{ type: String }],
        owner: {type: String, default: 'admin'}
    },
    {
        timestamps: true
    }
)

productsSchema.plugin(paginate)

export const productsModel = mongoose.model(productsCollection, productsSchema)