const express = require('express')
require('../../configs/connect')
const getProduct = express.Router()
const { Product } = require('../../models/product')

getProduct.post('/getAll', async (req, res) => {
    try {
        const data = await Product.find({},{_id:0,id:1,name:1,skuList:1})
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = getProduct