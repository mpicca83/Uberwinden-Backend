import mongoose from "mongoose"

const usersCollection = 'users'
const usersSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, unique: true, required: true},
        password: {type: String},
        rol: {type: String, default:"usuario"},
        cart: { type: mongoose.Types.ObjectId, ref: 'carts'}
    },
    {
        timestamps: true
    }
)


export const usersModel = mongoose.model(usersCollection, usersSchema)