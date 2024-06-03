let inputCarrito=document.getElementById("carrito2")
let cid=inputCarrito.value

const eliminar=async(pid)=>{
    
    let respuesta=await fetch(`/api/carts/${cid}/products/${pid}`,{
        method:"delete"
    })

    await verifyToken(respuesta)

    if(respuesta.status===200){
        
        Toastify({
            text: "Producto eliminado del carrito...!!!",
            duration: 3000,
            gravity: 'bottom',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast()
        setTimeout(() =>{
            location.reload()
        }, 3000);
    }
}

const dec = async(pid)=>{

    let respuesta=await fetch(`/api/carts/decQuantity/${cid}/products/${pid}`,{
        method:"put"
    })

    await verifyToken(respuesta)

    if(respuesta.status===200){
        
        Toastify({
            text: "Cantidad actualizada...",
            duration: 3000,
            gravity: 'bottom',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast()
        setTimeout(() =>{
            location.reload()
        }, 500);
    }

    if(respuesta.status===404){
        
        Toastify({
            text: "No es posible disminuir en menos de 1.",
            duration: 3000,
            gravity: 'bottom',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast()
    }
}

const inc = async(pid)=>{
    
    let respuesta=await fetch(`/api/carts/incQuantity/${cid}/products/${pid}`,{
        method:"put"
    })

    await verifyToken(respuesta)

    if(respuesta.status===200){
        
        Toastify({
            text: "Cantidad actualizada...",
            duration: 3000,
            gravity: 'bottom',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast()
        setTimeout(() =>{
            location.reload()
        }, 500);
    }

    if(respuesta.status===404){
        
        Toastify({
            text: "No es posible incrementar en más del stock.",
            duration: 3000,
            gravity: 'bottom',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast()
    }
}

const verifyToken = async (response) => {
    if (!response.ok) {
        const resp = await response.json();
        if (resp.error === 'El token ha expirado.' || resp.error === 'jwt expired') {

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
    return true
}