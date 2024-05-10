let inputCarrito=document.getElementById("carrito2")
let cid=inputCarrito.value

const eliminar=async(pid)=>{
    
    let respuesta=await fetch(`/api/carts/${cid}/products/${pid}`,{
        method:"delete"
    })

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