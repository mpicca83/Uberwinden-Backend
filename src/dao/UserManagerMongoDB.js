import { usersModel } from "./models/usersModel.js"

export default class UserManagerMongoDB {

    async createUser(user){
        let newUser = await usersModel.create(user)
        return newUser.toJSON()
    }

    async getUserBy(filtro){
        return await usersModel.findOne(filtro).populate("cart").lean()
    }
}

