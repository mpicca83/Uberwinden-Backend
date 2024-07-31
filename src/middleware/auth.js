import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'

const { SECRET } = config

export const auth=(roles=[])=>{

    return (req, res, next)=>{

        try {

            const token = req.cookies["cookieToken"]
            let expired = false
            roles=roles.map(p=>p.toLowerCase())

            if(token){
                jwt.verify(token, SECRET, (err, decoded) => {
                    if (err) {
                        expired=true
                    }
                    req.user = decoded;
                })
            }

            if(expired){
                res.clearCookie('cookieToken')
                return res.status(401).json({
                    status: 'error',
                    error: 'Unauthorized',
                    message: 'El token ha expirado.'
                })
            }

            if(roles.includes("public")){
                return next()
            }

            if(!req.user){

                res.setHeader('Content-Type','application/json');
                return res.status(401).json({
                    status: 'error',
                    error: 'Unauthorized',
                    message: 'No hay usuarios autenticados'
                })

            }else if(!req.user.rol){

                res.setHeader('Content-Type','application/json');
                return res.status(401).json({
                    status: 'error',
                    error: 'Unauthorized',
                    message: 'El Usuario no tiene un rol asignado'
                })
            }

            if(!roles.includes(req.user.rol.toLowerCase())){

                res.setHeader('Content-Type','application/json')
                return res.status(403).json({
                    status: 'error',
                    error: 'Forbidden',
                    message: 'Privilegios insuficientes para acceder.'
                })
            }

            return next()
                
        }catch (error) {
            
            req.logger.error(error);
            return res.status(500).json({
                status: 'error',
                error: 'Internal Server Error',
                message:'Error inesperado en el servidor - Intente más tarde, o contacte a su administrador',
            })
        }
    }
}