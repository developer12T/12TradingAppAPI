const express = require('express')
require('../../configs/connect')
const ProductManage = express.Router()
const {Product} = require('../../models/product')
const {Route} = require("../../models/route");

ProductManage.post('/getAll', async (req, res) => {
    const data = await Product.find({},{_id:0,__v:0})
    res.status(200).json(data)
})

ProductManage.post('/addProduct', async (req, res) => {
    const idInsert = await Product.findOne({},{_id:0,idIndex:1}).sort({idIndex:-1})
    if(idInsert === null ){
        var idIndex = 1
    }else{
        var idIndex = idInsert.idIndex + 1
    }
    req.body.idIndex = idIndex
    const newRoute = new Product(req.body)
    await newRoute.save()
    res.status(200).json(newRoute)
})

ProductManage.put('/updateProduct', async (req, res) => {
    const data = await Product.find({},{_id:0,__v:0})
    res.status(200).json('update product')
})

module.exports = ProductManage