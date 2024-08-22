import { MessageManagerMongoDB as MessageManager } from '../dao/MessageManagerMongoDB.js'

class MessageService {

    constructor(dao){
        this.dao=dao
    }

    getMessages = async () => {
        return await this.dao.getMessages()
    }

    addMessage = async (message) => {
        return await this.dao.addMessage(message)
    }
}

export const messageService = new MessageService(new MessageManager())