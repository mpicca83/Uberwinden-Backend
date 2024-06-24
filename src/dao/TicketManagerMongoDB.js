import { ticketsModel } from "./models/ticketModel.js"

export class TicketManagerMongoDB {

    async createTicket(ticket){
        const newTicket = await ticketsModel.create(ticket)
        return newTicket.toJSON()
    }

    async getAll(){
        return await ticketsModel.find().lean()
    }
}