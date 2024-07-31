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

    await fetch(`/api/carts/${cid}/product/${pid}`,{
        method:"post"
    })
    .then (async response => {

        let resp = await response.json()
        
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
            },4000)
        }else{
            Toastify({
                text: resp.message,
                duration: 3000,
                gravity: 'bottom',
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
            }).showToast()
        }
    })
}

const primera = async (hasPrevPage)=>{
    if(hasPrevPage==='true'){
        const response = await fetch(`/products?page=1`, { method: 'GET'});
        const isValid = await verifyToken(response);
        isValid && (window.location.href = `/products?page=1`)
    }
}

const anterior = async (dato)=>{
    const prevPage = dato.split(",")
    if(prevPage[1]==='true'){
        const response = await fetch(`/products?page=${prevPage[0]}`, { method: 'GET'});
        const isValid = await verifyToken(response);
        isValid && (window.location.href = `/products?page=${prevPage[0]}`)
    }
}

const siguiente = async (dato)=>{
    const nextPage = dato.split(",")
    if(nextPage[1]==='true'){
        const response = await fetch(`/products?page=${nextPage[0]}`, { method: 'GET'});
        const isValid = await verifyToken(response);
        isValid && (window.location.href = `/products?page=${nextPage[0]}`)
    }
}

const ultima = async (dato)=>{
    const nextPage = dato.split(",")
    if(nextPage[1]==='true'){
        const response = await fetch(`/products?page=${nextPage[0]}`, { method: 'GET'});
        const isValid = await verifyToken(response);
        isValid && (window.location.href = `/products?page=${nextPage[0]}`)
    }
}


const verifyToken = async (response) => {
    if (!response.ok) {
        const resp = await response.json();
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
    return true
}