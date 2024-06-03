import jwt from 'jsonwebtoken'
import { SECRET } from '../utils.js'

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
                return res.status(401).json({error: 'El token ha expirado.'})
            }

            if(roles.includes("public")){
                return next()
            }

            if(!req.user){
                res.setHeader('Content-Type','application/json');
                return res.status(401).json({error:`No hay usuarios autenticados`})
            }else if(!req.user.rol){
                res.setHeader('Content-Type','application/json');
                return res.status(401).json({error:`El Usuario no tiene un rol asignado`})
            }

            if(!roles.includes(req.user.rol.toLowerCase())){
                res.setHeader('Content-Type','application/json');
                return res.status(403).json({error:`Privilegios insuficientes para acceder.`})
            }

            return next()
                
        }catch (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}