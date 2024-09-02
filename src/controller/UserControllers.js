import { userService } from '../repositories/UserService.js'
import { email as sendEmail } from '../helpers/email.js'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import { generaHash, validaPassword } from '../utils.js'
import { UserDTO } from '../dto/UserDTO.js'

const { SECRET, HOST_URL } = config

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
            const htmlContent = () => {
                let html = `
                    <p>Para restablecer la contraseña debe ingresar al siguinete enlace:</p>
                    </br>
                    <a href="${HOST_URL}/resetPassword?token=${token}">Restablecer contraseña</a>`
                return html
            }

            sendEmail(email, 'Überwinden-Ecommerce: Restablecer contraseña', htmlContent())
        
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
        const newRol  = req.body.rol

        let identification = null
        let addressProof = null
        let bankStatement = null

        
        try {

            const {documents, rol} = await userService.getUserBy({_id: uid})
            
            if(rol !== 'admin'){
                
                if(documents){
                    identification = documents.find(data => data.name === 'identification')
                    addressProof = documents.find(data => data.name === 'addressProof')
                    bankStatement = documents.find(data => data.name === 'bankStatement')
                }
                
                if( newRol === 'premium' && ( !identification || !addressProof || !bankStatement )){
                    res.setHeader('Content-Type','application/json')
                    return res.status(409).json({
                        status: 'error',
                        error: 'Conflict',
                        message: `El usuario no ha terminado de procesar su documentación.`,
                    })
                }

                const updateUser = await userService.updateUser(uid, { rol: newRol })

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
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message:`No es posible modificar un usuario Administrador.`
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

    static updateDocuments = async(req, res) => {

        const { uid } = req.params
        const { _id } = req.user

        try {

            if(_id == uid){

                let {documents} = await userService.getUserBy({ _id: uid })
                const newDocuments = req.files
                
                if(!newDocuments || Object.keys(newDocuments).length === 0){
                    res.setHeader('Content-Type','application/json')
                    return res.status(400).json({
                        status: 'error',
                        error: 'Bad Request',
                        message: 'No se cargó ningún archivo. Por favor, suba al menos un documento.',
                    })
                }
                
                const updateDocumentArray = (documentType, newFiles) => {

                    const updatedDocs = newFiles.map(file => ({
                        name: documentType,
                        reference: file.destination + '/' + file.filename, 
                    }))

                    if(documents){
                        const existingDocs = documents.filter(doc => doc.name !== documentType);
                    
                        return [...existingDocs, ...updatedDocs]
                    }else{
                        return [...updatedDocs]
                    }

                }
        
                if (newDocuments['identification']) {
                    documents = updateDocumentArray('identification', newDocuments['identification'])
                }
                if (newDocuments['addressProof']) {
                    documents = updateDocumentArray('addressProof', newDocuments['addressProof'])
                }
                if (newDocuments['bankStatement']) {
                    documents = updateDocumentArray('bankStatement', newDocuments['bankStatement'])
                }
        
                const updateDocument = await userService.updateUser(uid, { documents: documents })
                
                res.status(200).json({
                    status: 'success',
                    message: 'Los documentos fueron cargados exitosamente.',
                    documents: updateDocument.documents
                })

            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'No posee los permisos suficientes para realizar esta acción.',
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

    static getUsers = async(req, res) => {

        try {
            
            let users = await userService.getUsers()

            users = users.map(user => new UserDTO(user))
        
            if(users){
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'Detalle de usuarios activos.',
                    payload: users
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(500).json({
                    status: 'error',
                    error: 'Internal Server Error',
                    message: 'No se pudo obtener los datos de los usuarios, por favor vuelva a intentar.',
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

    static deleteUser = async(req, res) =>{
        const { uid } = req.params
        const { user } = req
            
        try {

            if(user._id !== uid){

                const result = await userService.deleteUser(uid)
                
                if(result){
                    res.setHeader('Content-Type','application/json')
                    return res.status(200).json({
                        status: 'success',
                        message:`Usuario eliminado correctamente.`
                    })
                }else{
                    res.setHeader('Content-Type','application/json')
                    return res.status(404).json({
                        status: 'error',
                        error: 'Not Found',
                        message:`El usuario no pudo ser eliminado, por favor intente nuevamente.`
                    })
                }

            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message:`No es posible eliminar su propio usuario.`
                })
            }

        } catch (error) {
            req.logger.error(error.message)            
            res.setHeader('Content-Type','application/json')
            return res.status(500).json({
                status: 'error',
                error: 'Internal Server Error',
                message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
            })

        }
    }

    static deleteInactiveUsers = async(req, res) => {

        try {

            let usersRemove = []
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            const users = await userService.getUsers()
            const htmlContent = () => {
                let html = `
                    <p>Estimado usuario,</p>
                    <p>Le informamos que su cuenta ha sido eliminada debido a inactividad.</p>
                    <p>Si desea volver a ingresar, por favor registre nuevamente sus datos.</p>
                    <br/>
                    <p>Atentamente,</p>
                    <p>El equipo de Überwinden-Ecommerce</p>
                `
                return html
            }
            
            for ( const user of users){

                const lastConnectionDate = new Date(user.last_connection)
                
                if(user.rol !== 'admin' && (lastConnectionDate < twoDaysAgo || !user.last_connection)){            
                    usersRemove.push(new UserDTO(user))
                    
                    sendEmail(user.email, 'Überwinden-Ecommerce: Notificación de Eliminación de Cuenta por Inactividad', htmlContent())
                    await userService.deleteUser(user._id)
                }
            }
        
            if(usersRemove.length > 0){
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'Usuarios eliminados.',
                    payload: usersRemove
                })
            }else{
                res.setHeader('Content-Type','application/json')
                return res.status(200).json({
                    status: 'success',
                    message: 'No se encontraron usuarios inactivos.'
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