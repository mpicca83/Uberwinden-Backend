import { Router } from 'express'
import { auth } from '../middleware/auth.js'

export const router=Router()

router.get('/', auth(['public']), (req, res) => {

    req.logger.fatal('Este es un mensaje en el nivel FATAL')
    req.logger.error('Este es un mensaje en el nivel ERROR')
    req.logger.warning('Este es un mensaje en el nivel WARNING')
    req.logger.info('Este es un mensaje en el nivel INFO')
    req.logger.http('Este es un mensaje en el nivel HTTP')
    req.logger.debug('Este es un mensaje en el nivel DEBUG')
    
    res.setHeader('Content-Type','application/json')
    return res.status(200).json({
        status: 'success',
        message: 'El test de logger fue completado. Verifique la terminal para ver los resultados.'
    })

})