import passport from "passport"
import local from "passport-local"
import github from "passport-github2"
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
                    let newUser = await userManager.createUser({name, email: username, password, cart: newCart._id})
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

                    let user = await userManager.getUserBy({email:username})
                    if(!user){
                        return done(null, false)
                    }

                    if(!validaPassword(password, user.password)){
                        return done(null, false)    
                    }
                    
                    delete user.password
                    return done(null, user)

                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use(
        'github',
        new github.Strategy(
            {
                clientID: 'Iv23liRZBQ3oz0zZhxdw',
                clientSecret: '65beaf03105afdbb8f5354b67882a3cd188b209f',
                callbackURL: 'http://localhost:8080/api/sessions/callbackGithub'
            },
            async (tokenAcceso, tockenRefresh, profile, done) => {
                try {

                    let email = profile._json.email
                    if(!email){
                        return done(null, false)
                    }

                    let name = profile._json.name
                    if(!name){
                        return done(null, false)
                    }

                    let user = await userManager.getUserBy({email})
                    if(!user){
                        const newCart = await cartManager.addCart()
                        user = await userManager.createUser({
                            name,
                            email,
                            cart: newCart._id
                        })
                        user = await userManager.getUserBy({email})
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