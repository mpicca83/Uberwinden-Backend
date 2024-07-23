import { usersModel } from "./models/usersModel.js"

export class UserManagerMongoDB {

    async createUser(user){
        let newUser = await usersModel.create(user)
        return newUser.toJSON()
    }

    async getUserBy(filtro){
        return await usersModel.findOne(filtro).populate("cart").lean()
    }

    async updateUser(id, objetUpdate){
        return await usersModel.findByIdAndUpdate(id, objetUpdate, {runValidators: true, returnDocument: "after"})
    }
}

