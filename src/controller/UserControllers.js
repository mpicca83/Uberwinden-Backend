import { userService } from '../repositories/UserService.js'
import { email as sendEmail } from '../helpers/email.js'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import { generaHash, validaPassword } from '../utils.js'
import { UserDTO } from '../dto/UserDTO.js'

const { SECRET, PORT } = config

export class UserController{

    static forgotPassword = async (req, res) => {
        try {

            const {email} = req.body
            const user = await userService.getUserBy({email})

            if(!user){
                res.setHeader('Content-Type','application/json')
                return res.status(401).json({
                    status: 'error',
                    error: 'Unauthorized',
                    message: "El email ingresado no es válido."
                })
            }

            let token = jwt.sign({email}, SECRET, {expiresIn: "1h"})
            
            //genera cuerpo del email
            const htmlConten = () => {
                let html = `
                    <p>Para restablecer la contraseña debe ingresar al siguinete enlace:</p>
                    </br>
                    <a href="http://localhost:${PORT}/resetPassword?token=${token}">Restablecer contraseña</a>`
                return html
            }

            sendEmail(email, 'Überwinden - Restablecer contraseña', htmlConten())
        
            res.setHeader('Content-Type','application/json')
            return res.status(200).json({
                status: 'success',
                message: 'Email enviado correctamente.',
            })
 
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error: 'Internal Server Error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                }
            )
        }
    }

    static resetPassword = async(req, res) => {

        let { token, password } = req.body
        let email = ''
        let expired = false

        if(token){
            jwt.verify(token, SECRET, (err, decoded) => {
                if (err) {
                    expired=true
                }else{
                    email = decoded.email
                }
            })
        }else{
            res.setHeader('Content-Type','application/json')
            return res.status(400).json({
                status: 'error',
                error: 'Bad Request',
                message: 'Token inválido.'
            })
        }

        if(expired){
            res.setHeader('Content-Type','application/json')
            return res.status(401).json({
                status: 'error',
                error: 'Unauthorized',
                message: 'El token ha expirado. Debe generar uno nuevo.'
            })
        }

        try {
            
            const user = await userService.getUserBy({email})

            if(user.password && validaPassword(password, user.password)){
                res.setHeader('Content-Type','application/json')
                return res.status(409).json({
                    status: 'error',
                    error: 'Conflict',
                    message: 'Contraseña inválida, debe ingresar una distinta a las anteriores.'
                })
            }

            password = generaHash(password)

            const newPassword = await userService.updateUser(user._id, {password})

            if(newPassword){
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'La contraseña se restableció correctamente',
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(500).json({
                    status: 'error',
                    error: 'Internal Server Error',
                    message: 'No se pudo restablecer. Por favor volver a intentar.',
                })
            }

        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error: 'Internal Server Error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                }
            )
        }
    }

    static updateRol = async(req, res) => {

        const { uid } = req.params
        const { rol } = req.body

        try {
            
            const updateUser = await userService.updateUser(uid, { rol: rol })

            if(updateUser){
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'El rol se actualizó correctamente.',
                    payload: new UserDTO(updateUser)
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(500).json({
                    status: 'error',
                    error: 'Internal Server Error',
                    message: 'No se pudo actualizar el rol, por favor vuelva a intentar.',
                })
            }
            
        } catch (error) {
            req.logger.error(error.message)
            res.setHeader('Content-Type','application/json')
            return res.status(500).json(
                {
                    status: 'error',
                    error: 'Internal Server Error',
                    message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
                }
            )
        }
    }

}