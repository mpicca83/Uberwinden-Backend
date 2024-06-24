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
}

export const userService = new UserService(new UserManager)