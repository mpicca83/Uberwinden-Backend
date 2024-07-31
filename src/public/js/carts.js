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

    if(respuesta.status===409){
        
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

    if(respuesta.status===409){
        
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

const comprar = async() => {

    let respuesta=await fetch(`/api/carts/${cid}/purchase`,{
        method:"post"
    })

    let data = await respuesta.json()

    await verifyToken(respuesta)

        //Para formatear la fecha y hora
    let formattedDate=null
    let formattedTime=null
    if(data.ticket){
        const date = new Date(data.ticket.purchase_datetime)
        const dateInArgentina = new Date(date.getTime() - 3 * 60 * 60 * 1000)
        formattedDate = dateInArgentina.toISOString().split('T')[0];
        formattedTime = dateInArgentina.toISOString().split('T')[1].split('.')[0];
    }

    if(respuesta.status===200){
        
        const product = (products) => {
            return products.map(p => `<li>${p.title} - Cantidad: ${p.quantity} - Precio: $${p.price} - Subtotal: $${p.subTotal}</li>`).join('');
        }

        const htmlConten = () => {
            let html = `<p><b>${data.message}</b></p>`;
    
            if (data.status === 'success') {
                html += `   </br>
                            <p><b>Tickets de Compra:</b><p>
                            <p>Operación: ${data.ticket.code}</p>
                            <p>Fecha y hora: ${formattedDate} - ${formattedTime}</p>
                            <p>Total de la compra: $${data.ticket.amount}</p>
                            <p>Email: ${data.ticket.purchaser}</p>
                            </br>
                            <p><strong>Productos comprados:</strong></p>
                            <ul>${product(data.confirmed)}</ul>`
            } 
            if (data.status === 'partial_success') {
                html += `   </br>
                            <p><b>Tickets de Compra:</b><p>
                            <p>Operación: ${data.ticket.code}</p>
                            <p>Fecha y hora: ${formattedDate} - ${formattedTime}</p>
                            <p>Total de la compra: $${data.ticket.amount}</p>
                            <p>Email: ${data.ticket.purchaser}</p>
                            </br>
                            <p><strong>Productos comprados:</strong></p>
                            <ul>${product(data.confirmed)}</ul>
                            </br>
                            <p><strong>Productos rechazados:</strong></p>
                            <ul>${product(data.rejected)}</ul>`
            } 
            if (data.status === 'fail') {
                html += `   </br>
                            <p><strong>Productos rechazados:</strong></p>
                            <ul>${product(data.rejected)}</ul>`
            } 
            return html;
        }

        Swal.fire({
            html: htmlConten(),
            icon: data.status==='success'?'success':data.status==='fail'?'error':'warning',
            position: 'top',
            width: '80%',
            showClass:{popup:'animate__animated animate__fadeInDown'},
            hideClass:{pupup:'animate__animated animate__fadeOutUp'},
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload()
            }
        })
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