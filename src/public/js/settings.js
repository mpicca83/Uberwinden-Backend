const eliminar=async(id)=>{

    Swal.fire({
        title: '¿Confirma eliminar el usuario?',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#3085d6',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Eliminar',
        position: 'top',

    }).then(async(result) =>{

        if(result.isConfirmed){

            let respuesta=await fetch(`/api/users/delete/${id}`,{
                method:"delete"
            })
        
            const respJson = await verifyToken(respuesta)
            
            Swal.fire({
                title: respJson.message,
                icon: respuesta.status===200 ? 'success' : 'error',
                position: 'top',
                showConfirmButton: false,
                timer: 2000,
                showClass:{popup:'animate__animated animate__fadeInDown'},
                hideClass:{pupup:'animate__animated animate__fadeOutUp'},
            })
            setTimeout(() =>{
                location.reload()
            }, 2000);
            
        }
    })
}

const modificar=async(id)=>{

    Swal.fire({
        title: 'Seleccione una de las siguientes opciones:',
        icon: 'question',
        showCancelButton: false,
        showDenyButton: true,
        confirmButtonText: 'User',
        denyButtonText: 'Premium',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#aaa',
        denyButtonColor: '#3085d6',
        position: 'top',

    }).then(async(result) =>{

        if(result.isConfirmed){

            let respuesta=await fetch(`/api/users/premium/${id}`, {
                method:"post",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({rol: 'user'})
            })
        
            const respJson = await verifyToken(respuesta)
            
            Swal.fire({
                title: respJson.message,
                icon: respuesta.status===200 ? 'success' : 'error',
                position: 'top',
                showConfirmButton: false,
                timer: 2000,
                showClass:{popup:'animate__animated animate__fadeInDown'},
                hideClass:{pupup:'animate__animated animate__fadeOutUp'},
            })
            setTimeout(() =>{
                location.reload()
            }, 2000)
            
        }else if(result.isDenied){

            let respuesta=await fetch(`/api/users/premium/${id}`, {
                method:"post",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({rol: 'premium'})
            })
        
            const respJson = await verifyToken(respuesta)
            
            Swal.fire({
                title: respJson.message,
                icon: respuesta.status===200 ? 'success' : 'error',
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                showClass:{popup:'animate__animated animate__fadeInDown'},
                hideClass:{pupup:'animate__animated animate__fadeOutUp'},
            })
            setTimeout(() =>{
                location.reload()
            }, 3000)
        }
    })
}


const verifyToken = async (response) => {
    let resp = await response.json()

    if (!response.ok) {
        
        if (resp.message === 'El token ha expirado.' || resp.message === 'jwt expired') {

            Toastify({
                text: "La sesión ha expirado...",
                duration: 3000,
                gravity: 'bottom',
                style: {
                    background: "linear-gradient(to right, #ff0000, #ff4d4d)",
                },
            }).showToast()
    
            setTimeout(async()=>{
                window.location.href='/api/sessions/logout?web=true'
            },3000)   
            return false
        }    
    }
    return resp
}