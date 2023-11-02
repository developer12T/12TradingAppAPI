const express = require('express')
require('../../configs/connect')
const getProduct = express.Router()
const {Product} = require('../../models/product')
const  axios  = require('axios')

getProduct.post('/getAll', async (req, res) => {
    try {
        const data = await Product.find({}, {_id: 0, id: 1, name: 1, skuList: 1})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error.message)
    }
})

getProduct.post('/getDetail', async (req, res) => {
    try {
        const data = await Product.findOne({id:req.body.id}, {_id: 0, id: 1, name: 1, skuList: 1})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error.message)
    }
})

module.exports = getProduct