export const validateUploadDocument = (err, req, res, next) => {

    if(err){
        let error1 = 'Solo se acepta la carga de los siguientes documentos: identification - addressProof - bankStatement. Máximo 3 archivos por ítem.'
        res.setHeader('Content-Type','application/json')
        return res.status(400).json(
            {
                status: 'error',
                error: 'Bad Request',
                message: err.message==='Unexpected field' ? error1 : err.message,
            })
    }
    next()
}




