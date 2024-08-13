import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        let folder = './src/uploads'

        if(!file){
            return cb(new Error("El archivo no se cargar, por favor volver a intentar."))
        }

        if(file.fieldname === 'identification' || file.fieldname === 'addressProof' || file.fieldname === 'bankStatement'){
            folder = folder+'/documents'
        }else if(file.fieldname === 'products'){
            folder = folder+'/products'
        }else if(file.fieldname === 'profiles'){
            folder = folder+'/profiles'
        }

        cb(null, folder)
    },
    filename: function (req, file, cb) {
        
        let tipo=file.mimetype.split("/")[1]
        
        if(tipo!=="pdf" && tipo!=="jpeg" && tipo!=="png"){
            return cb(new Error("Solo se admiten archivos con las siguientes extensiones: PDF / JPEG / PNG"))
        }

        cb(null, Date.now() + '-' + file.originalname)

    }
})

export const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } })