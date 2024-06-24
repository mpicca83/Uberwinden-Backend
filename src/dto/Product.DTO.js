export class ProductDTO {
    constructor(product){
        this.id = product.product._id
        this.title = product.product.title,
        this.code = product.product.code,
        this.price = product.product.price,
        this.quantity = product.quantity,
        this.subTotal = product.product.price * product.quantity
    }
}