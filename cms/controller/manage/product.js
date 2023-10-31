const express = require('express')
require('../../configs/connect')
const ProductManage = express.Router()
const {Product} = require('../../models/product')

ProductManage.post('/getAll', async (req, res) => {
    const data = await Product.find({},{_id:0,__v:0})
    res.status(200).json(data)
})

ProductManage.post('/addProduct', async (req, res) => {
    const data = await Product.find({},{_id:0,__v:0})
    res.status(200).json(data)
})

module.exports = ProductManage
