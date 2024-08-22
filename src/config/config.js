import dotenv from "dotenv"
import {Command, Option} from "commander"

let programa=new Command()

programa.addOption(new Option("-m, --mode <modo>", "Modo de ejecución.").choices(["dev", "prod"]).default("prod"))

programa.parse()
const argumentos=programa.opts()

export const runMode=argumentos.mode

console.log(`Conectado en modo: ${runMode}`)

dotenv.config(
    {
        path: './src/.env',
        override: true
    }
)

export const config={
    PORT: process.env.PORT||3001,
    MONGO_URL: process.env.MONGO_URL, 
    DB_NAME: process.env.DB_NAME,
    SECRET: process.env.SECRET,
    CLIENT_ID_GITHUB: process.env.CLIENT_ID_GITHUB,
    CLIENT_SECRET_GITHUB: process.env.CLIENT_SECRET_GITHUB,
    CALLBACK_URL_GITHUB: process.env.CALLBACK_URL_GITHUB,
    SERVICE_NODEMAILER: process.env.SERVICE_NODEMAILER,
    PORT_NODEMAILER: process.env.PORT_NODEMAILER,
    USER_NODEMAILER: process.env.USER_NODEMAILER,
    PASS_NODEMAILER: process.env.PASS_NODEMAILER,
    FROM_NODEMAILER: process.env.FROM_NODEMAILER,
    EMAIL_ADMIN: process.env.EMAIL_ADMIN,
    PASSWORD_ADMIN: process.env.PASSWORD_ADMIN

}