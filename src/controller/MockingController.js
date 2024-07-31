import {fakerES_MX as faker} from "@faker-js/faker"

export class MockingController{

    static generateMockingProducts = (req, res) => {

        let products = []

        const newProduct = () => {
            return {
                _id: faker.database.mongodbObjectId(),
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                code: faker.string.alphanumeric(5).toUpperCase(),
                price: parseFloat(faker.commerce.price()),
                status: true,
                stock: faker.number.int({ min: 0, max: 100 }),
                category: faker.commerce.department(),
                thumbnails: [faker.image.url(), faker.image.url()],
                createdAt: faker.date.past().toISOString(),
                updatedAt: faker.date.recent().toISOString(),
                __v: 0
            }
        }

        for(let i=0; i<100; i++){
            products.push(newProduct())
        }

        return products
    }

    static getMockingProducts = (req, res) => {

        const products = this.generateMockingProducts()

        res.setHeader('Content-Type','application/json')
        return res.status(200).json({
            status: 'success',
            message: 'Los productos Mocking se generaron con éxito.',
            payload: products,
        })
    }
}
