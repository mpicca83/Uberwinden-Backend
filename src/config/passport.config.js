import passport from "passport"
import local from "passport-local"
import { generaHash, validaPassword } from "../utils.js"
import UserManagerMongoDB from '../dao/UserManagerMongoDB.js'  
import CartManagerMongoDB from '../dao/CartManagerMongoDB.js'

const userManager = new UserManagerMongoDB()
const cartManager = new CartManagerMongoDB()

export const initPassport = () => {

    passport.use(
        'register',
        new local.Strategy(
            {
                usernameField: 'email',
                passReqToCallback: true
            },
            async (req, username, password, done) => {
                try {

                    let {name}=req.body
                    if(!name){
                        return done(null, false)
                    }
                    
                    const validateEmail = await userManager.getUserBy({email:username})
                    if(validateEmail){
                        return done(null, false)
                    }

                    password = generaHash(password)

                    const newCart = await cartManager.addCart()
                    let newUser = await userManager.createUser({name, email: username, password, rol:'usuario', cart: newCart._id})
                    return done(null, newUser)

                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use(
        'login',
        new local.Strategy(
            {
                usernameField: 'email',
            },
            async (username, password, done) => {
                try {

                    let user = null

                    if(username==='adminCoder@coder.com' && password==='adminCod3r123'){
                        user = {
                            name: 'Administrador',
                            email: 'adminCoder@coder.com',
                            rol: 'admin'
                        }
                    }else{
                        user = await userManager.getUserBy({email:username})
                        if(!user){
                            return done(null, false)
                        }

                        if(!validaPassword(password, user.password)){
                            return done(null, false)    
                        }
                    }
                    
                    return done(null, user)

                } catch (error) {
                    return done(error)
                }
            }
        )
    )


    passport.serializeUser((user, done)=>{
        return done(null, user._id)
    })

    passport.deserializeUser(async(id, done)=>{
        let user=await userManager.getUserBy({_id:id})
        return done(null, user)
    })
}
