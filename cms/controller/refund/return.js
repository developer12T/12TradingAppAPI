const express = require('express')
require('../../configs/connect')
const { Product }  = require('../../models/product')
const changeProduct = express.Router()

changeProduct.post('/getAll', async (req, res) => {
    try {
        const data = await Product.find().exec()
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = changeProduct

