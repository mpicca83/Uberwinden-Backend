
const login = async(e) => {

    e.preventDefault()
    let [email, password] = new FormData(document.getElementById("formLogin")).values()

    let body={email, password}

    await fetch("/api/sessions/login", {
        method:"post", 
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(body)
    })
    .then (async response => {

        let resp = await response.json()
        if(Array.isArray(resp.message)){
            let newMsg = ''
            resp.message.forEach(e => {
                newMsg += e.msg + ' '
            })
            resp.message = newMsg
        }

        if(response.ok){
            Toastify({
                text: "Login correcto!!!",
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast()
            setTimeout(()=>{
                window.location.href="/products"
            },2000)
        }
        else{
            Toastify({
                text: resp.message,
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: "linear-gradient(to right, #ff0000, #ff4d4d)",
                }
            }).showToast()
        }
    })
}

const register = async(e) => {

    e.preventDefault()
    let [first_name, last_name, email, age, password] = new FormData(document.getElementById("formRegister")).values()

    if (age === '' || age === undefined) {
        age = 0;
    }
    let body={first_name, last_name, email, age, password}
    
    await fetch("/api/sessions/register", {
        method:"post", 
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(body)
    })
    .then (async response => {

        let resp = await response.json()
        if(Array.isArray(resp.message)){
            let newMsg = ''
            resp.message.forEach(e => {
                newMsg += e.msg + ' '
            })
            resp.message = newMsg
        }

        if(response.ok){
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
                text: resp.message,
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: "linear-gradient(to right, #ff0000, #ff4d4d)",
                }
            }).showToast()
        }
    })
}

const forgotPassword = async(e) => {
    
    e.preventDefault()
    let [email] = new FormData(document.getElementById("formForgotPassword")).values()

    await fetch("/api/sessions/forgotPassword", {
        method:"post", 
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({email})
    })
    .then (async response => {

        let resp = await response.json()
        if(Array.isArray(resp.message)){
            let newMsg = ''
            resp.message.forEach(e => {
                newMsg += e.msg + ' '
            })
            resp.message = newMsg
        }

        if(response.ok){
            Toastify({
                text: "Email enviado. Revisa tu correo para restablecer la contraseña.",
                duration: 6000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast()
            setTimeout(()=>{
                window.location.href="/products"
            },6000)
        }
        else{
            Toastify({
                text: resp.message,
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: "linear-gradient(to right, #ff0000, #ff4d4d)",
                }
            }).showToast()
        }
    })
}

const resetPassword = async(e) => {
    
    e.preventDefault()
    let inputToken=document.getElementById("token")
    let token=inputToken.value
    let [password] = new FormData(document.getElementById("formResetPassword")).values()

    await fetch("/api/sessions/resetPassword", {
        method:"post", 
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({ token, password })
    })
    .then (async response => {

        let resp = await response.json()
        if(Array.isArray(resp.message)){
            let newMsg = ''
            resp.message.forEach(e => {
                newMsg += e.msg + ' '
            })
            resp.message = newMsg
        }

        if(response.ok){
            Toastify({
                text: resp.message,
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast()
            setTimeout(()=>{
                window.location.href="/login"
            },3000)
        }
        else{
            Toastify({
                text: resp.message,
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: "linear-gradient(to right, #ff0000, #ff4d4d)",
                }
            }).showToast()
            if(response.status===401){
                setTimeout(()=>{
                    window.location.href="/forgotPassword"
                },3000)
            }
        }
    })
}