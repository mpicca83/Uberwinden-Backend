import nodemailer from 'nodemailer'
import { config } from "../config/config.js"

const { SERVICE_NODEMAILER, PORT_NODEMAILER, USER_NODEMAILER, PASS_NODEMAILER, FROM_NODEMAILER } = config

export const email = async(to, subject, html) => {

    const transporter = nodemailer.createTransport(
        {
            service: SERVICE_NODEMAILER,
            port: PORT_NODEMAILER,
            auth:{
                user: USER_NODEMAILER,
                pass: PASS_NODEMAILER
            }
        }
    )
    transporter.sendMail(
        {
            from: FROM_NODEMAILER,
            to,
            subject,
            html
        }
    )

}