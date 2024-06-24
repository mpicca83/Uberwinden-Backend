import passport from "passport"
import local from "passport-local"
import github from "passport-github2"
import passportJWT from "passport-jwt"
import { generaHash, validaPassword } from "../utils.js"
import { config } from "./config.js"
import { userService } from "../repositories/UserService.js"
import { cartService } from "../repositories/CartService.js"

const { SECRET, CLIENT_ID_GITHUB, CLIENT_SECRET_GITHUB, CALLBACK_URL_GITHUB } = config

const findToken=(req)=>{
    let token=null

    if(req.cookies["cookieToken"]){
        token=req.cookies["cookieToken"]
    }

    return token
}

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

                    let {first_name, last_name, age}=req.body
                    if(!first_name){
                        return done(null, false, {message:"Debe ingresar su Nombre."})
                    }
                    
                    const validateEmail = await userService.getUserBy({email:username})
                    if(validateEmail){
                        return done(null, false, {message:"El email ingresado ya se encuentra registrado."})
                    }

                    password = generaHash(password)

                    const newCart = await cartService.addCart()
                    let newUser = await userService.createUser(
                        {
                            first_name,
                            last_name,
                            email: username, 
                            age,
                            password,
                            cart: newCart._id
                        }
                    )
                    delete newUser.password
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

                    let user = await userService.getUserBy({email:username})
                    if(!user){
                        return done(null, false, {message:"El email ingresado no es válido."})
                    }

                    if(!validaPassword(password, user.password)){
                        return done(null, false, {message:"La contraseña ingresada no es válida."})    
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
                clientID: CLIENT_ID_GITHUB,
                clientSecret: CLIENT_SECRET_GITHUB,
                callbackURL: CALLBACK_URL_GITHUB
            },
            async (tokenAcceso, tockenRefresh, profile, done) => {
                
                try {

                    let email = profile._json.email
                    if(!email){
                        return done(null, false, {message:"El login fue rechazado por no tener registrado el email."})
                    }

                    let name = profile._json.name
                    if(!name){
                        return done(null, false, {message:"El login fue rechazado por no tener registrado el nombre."})
                    }

                    let user = await userService.getUserBy({email})
                    if(!user){
                        const newCart = await cartService.addCart()
                        user = await userService.createUser({
                            first_name: name,
                            email,
                            cart: newCart._id
                        })
                        user = await userService.getUserBy({email})
                    }
                    return done(null, user)

                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use(
        "current",
        new passportJWT.Strategy(
            {
                secretOrKey: SECRET,
                jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([findToken])
            },
            async(contToken, done)=>{ 
                try {
                    return done(null, contToken)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    //Solo si utilizo sessions
    // passport.serializeUser((user, done)=>{
    //     return done(null, user._id)
    // })

    // passport.deserializeUser(async(id, done)=>{
    //     let user=await userService.getUserBy({_id:id})
    //     return done(null, user)
    // })
}