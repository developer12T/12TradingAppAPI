const express = require('express')
require('../../configs/connect')
const ProductManage = express.Router()
const {Product} = require('../../models/product')

ProductManage.post('/getAll', async (req, res) => {
    try{
        const data = await Product.find({}, {_id: 0, __v: 0})
        res.status(200).json(data)
    }catch (e) {
        res.status(500).json(e.message)
    }
})

ProductManage.post('/addProduct', async (req, res) => {
    try {
        const idInsert = await Product.findOne({}, {_id: 0, idIndex: 1}).sort({idIndex: -1})
        if (idInsert === null) {
            var idIndex = 1
        } else {
            var idIndex = idInsert.idIndex + 1
        }
        req.body.idIndex = idIndex
        const newRoute = new Product(req.body)
        await newRoute.save()
        res.status(200).json(newRoute)
    } catch (e) {
        res.status(500).json(e.message)
    }
})

ProductManage.put('/updateProduct', async (req, res) => {
    try{
        const data = await Product.updateOne({id: req.body.id}, {$set: req.body})
        res.status(200).json('update '+data.modifiedCount+' row complete')
    }catch (error){
        res.status(500).json(error.message)
    }
})

module.exports = ProductManage