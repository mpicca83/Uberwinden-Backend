
const login = async(e) => {

    e.preventDefault()
    let [email, password] = new FormData(document.getElementById("formLogin")).values()

    let body={email, password}

    let user=await fetch("/api/sessions/login", {
        method:"post", 
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(body)
    })
    if(user.ok){
        Toastify({
            text: "Login correcto!!!",
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast()
        window.location.href="/products"
    }
    else{
        Toastify({
            text: "Credenciales incorrectas",
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: {
                background: "linear-gradient(to right, #ff0000, #ff4d4d)",
            }
        }).showToast()
    }
}

const register = async(e) => {

    e.preventDefault()
    let [name, email, password] = new FormData(document.getElementById("formRegister")).values()

    let body={name, email, password}

    let user=await fetch("/api/sessions/register", {
        method:"post", 
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(body)
    })
    if(user.ok){
        Toastify({
            text: "Registro correcto!!!",
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast()
        window.location.href="/login"
    }
    else{
        Toastify({
            text: "El Email ya se encuentra registrado.",
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: {
                background: "linear-gradient(to right, #ff0000, #ff4d4d)",
            }
        }).showToast()
    }
}
