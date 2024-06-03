const socket=io()

const productList = document.getElementById('products')

socket.on('productsAll', ({products}) => {

    productList.innerHTML=''
    products.forEach(product => {
        productList.innerHTML+=`<li class='ws'>${product.title}</li>`
    })
})

socket.on('productAdd', (newProduct) => {

    productList.innerHTML+=`<li class='ws'>${newProduct.title}</li>`

})

