import { messagesModel } from "./models/messagesModel.js"

export default class MessageManagerMongoDB {

     async getMessages(){

        return await messagesModel.find().lean()
    }

    async addMessage(message){

        return await messagesModel.create(message)
    }
}