export class UserDTO {
    constructor(user){
        this.full_name = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name
        this.email = user.email
        this.rol = user.rol
    }
}

export class UserDTO2 {
    constructor(user){
        this.full_name = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name
        this.email = user.email
        this.rol = user.rol
        this.id = user._id
    }
}