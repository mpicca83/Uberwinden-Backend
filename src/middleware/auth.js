export const auth=(req, res, next)=>{

    // if(!req.session.user){

    //     res.setHeader('Content-Type','application/json')
    //     return res.status(401).json({
    //         status: 'error',
    //         error:`No existen usuarios autenticados`
    //     })
    // }

    next()
}
