import mongoose from "mongoose"

const usersCollection = 'users'
const usersSchema = new mongoose.Schema(
    {
        first_name: {type: String, required: true},
        last_name: {type: String, default:""},
        email: {type: String, unique: true, required: true},
        age: {type: Number, default:0},
        password: {type: String},
        cart: { type: mongoose.Types.ObjectId, ref: 'carts'},
        rol: {type: String, enum: ['user', 'admin', 'premium'], default:"user"},
        documents: [{ 
            name: { type: String, required: true },
            reference: { type: String, required: true }
        }],
        last_connection: {type: Date},
    },
    {
        timestamps: true
    }
)

export const usersModel = mongoose.model(usersCollection, usersSchema)
