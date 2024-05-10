const socket=io()

Swal.fire({
    title:"Ingrese su email",
    input:"text",
    inputValidator: (value)=>{
        return !value && "Debe ingresar un email...!!!"
    },
    allowOutsideClick:false
}).then(datos=>{
    let user=datos.value
    document.title=`Chat de ${user}`

    let inputMensaje=document.getElementById("mensaje")
    let divMensajes=document.getElementById("mensajes")
    inputMensaje.focus()
    
    socket.emit("id", user)

    socket.on("nuevoUsuario", user=>{
        Swal.fire({
            text:`${user} se ha conectado...!!!`,
            toast:true,
            position:"top-right"
        })
    })

    socket.on("mensajesPrevios", messages=>{
        messages.forEach(m=>{
            divMensajes.innerHTML+=`<span class="mensaje"><strong>${m.user}</strong> dice: <i>${m.message}</i></span><br>`
            divMensajes.scrollTop=divMensajes.scrollHeight
        })
    })

    inputMensaje.addEventListener("keyup", e=>{
        e.preventDefault()

        if(e.code==="Enter" && e.target.value.trim().length>0){
            socket.emit("mensaje", user, e.target.value.trim())
            e.target.value=""
            e.target.focus()
        }
    })

    socket.on("nuevoMensaje", (nombre, mensaje)=>{
        divMensajes.innerHTML+=`<span class="mensaje"><strong>${nombre}</strong> dice: <i>${mensaje}</i></span><br>`
        divMensajes.scrollTop=divMensajes.scrollHeight
    })

    socket.on("saleUsuario", nombre=>{
        divMensajes.innerHTML+=`<span class="mensaje"><strong>${nombre}</strong> ha salido del chat... :(</span><br>`
        divMensajes.scrollTop=divMensajes.scrollHeight
    })

})
