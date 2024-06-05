
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
                text: resp.error,
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
    console.log(body);
    await fetch("/api/sessions/register", {
        method:"post", 
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(body)
    })
    .then (async response => {

        let resp = await response.json()

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
                text: resp.error,
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
