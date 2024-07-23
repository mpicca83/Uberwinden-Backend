import { UserManagerMongoDB as UserManager } from '../dao/UserManagerMongoDB.js'

class UserService{

    constructor(dao){
        this.dao=dao
    }

    createUser = async (user) => {
        return await this.dao.createUser(user)
    }

    getUserBy = async (filtro) => {
        return await this.dao.getUserBy(filtro)
    }

    updateUser = async (id, objetUpdate) => {
        return await this.dao.updateUser(id, objetUpdate)
    }
    
} 

export const userService = new UserService(new UserManager)