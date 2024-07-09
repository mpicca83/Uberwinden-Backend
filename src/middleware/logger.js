import { createLogger, transports, format } from 'winston'
import { runMode } from '../config/config.js'

const customLevels = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
}

const colors = {
    fatal: 'bold white redBG',
    error: 'red',
    warning: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
}

const transportDev = new transports.Console(
    {
        level: 'debug',
        format: format.combine(
            format.colorize({colors}),
            format.simple()
        )
    }
)


const transportProd = [
    new transports.Console(
        {
            level: 'info',
            format: format.combine(
                format.colorize({colors}),
                format.simple()
            )
        }
    ),
    new transports.File(
        {
            level: 'error',
            filename: './src/logs/errors.log',
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.json()
            )
        }
    )
]

export const logger = createLogger(
    {
        levels: customLevels,
    }
)

if(runMode == 'dev') {
    logger.add(transportDev)
}

if(runMode == 'prod') {
    logger.add(transportProd[0])
    logger.add(transportProd[1])
}

export const middLogger=(req, res, next)=>{
    req.logger=logger
    next()
}