import { TicketManagerMongoDB as TicketManager } from "../dao/TicketManagerMongoDB.js"

class TicketService{

    constructor(dao){
        this.dao=dao
    }

    createTicket = async (ticket) => {
        return await this.dao.createTicket(ticket)
    }

    getAll = async () => {
        return await this.dao.getAll()
    }

}

export const ticketService = new TicketService(new TicketManager)

