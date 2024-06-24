import mongoose from "mongoose"

const ticketsCollection = 'tickets'
const ticketsSchema = new mongoose.Schema(
    {
        code: {type: String, unique: true, required: true},
        purchase_datetime: {type: Date, required: true, default: Date.now},
        amount: {type: Number, required: true},
        purchaser: {type: String, required: true},
    },
    {
        timestamps: true
    }
)

export const ticketsModel = mongoose.model(ticketsCollection, ticketsSchema)