import {fileURLToPath} from 'url'
import {dirname} from 'path'
import bcrypt from 'bcrypt'
import passport from 'passport'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default __dirname

export const generaHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const validaPassword = (password, passwordHash) => bcrypt.compareSync(password, passwordHash)

export const passportCall = (strategy) => {
    return function (req, res, next) {
        passport.authenticate(strategy, function(err, user, info, status){
            
            if(err){
                return next(err)
            }
            if(!user){
                res.setHeader('Conten-Type', 'application/json')
                return res.status(info.statusCode ? info.statusCode : 401).json({
                    status: 'error',
                    error: info.type ? info.type : 'Unauthorized',
                    message: info.message ? info.message : info.toString()
                })
            }
        
            req.user = user
            return next()
        })(req, res, next)
    }
}

