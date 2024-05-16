const comprar=async(pid)=>{

    let inputCarrito=document.getElementById("carrito")
    let cid=inputCarrito.value

    if(!cid){
        Toastify({
            text: "Debe iniciar sesión para agregar productos al carrito.",
            duration: 3000,
            gravity: 'bottom',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast()
        return
    }

    let respuesta=await fetch(`/api/carts/${cid}/product/${pid}`,{
        method:"post"
    })

    if(respuesta.status===200){
        Toastify({
            text: "Producto agregado al carrito...!!!",
            duration: 3000,
            gravity: 'bottom',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast()
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

const primera = (hasPrevPage)=>{
    if(hasPrevPage==='true'){
        window.location.href = `/products?page=1`
    }
}

const anterior = (dato)=>{
    const prevPage = dato.split(",")
    if(prevPage[1]==='true'){
        window.location.href = `/products?page=${prevPage[0]}`
    }
}

const siguiente = (dato)=>{
    const nextPage = dato.split(",")
    if(nextPage[1]==='true'){
        window.location.href = `/products?page=${nextPage[0]}`
    }
}

const ultima = (dato)=>{
    const nextPage = dato.split(",")
    if(nextPage[1]==='true'){
        window.location.href = `/products?page=${nextPage[0]}`
    }
}

