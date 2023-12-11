const express = require('express')
require('../../configs/connect')
const ProductManage = express.Router()
const {Product} = require('../../models/product')
const {statusDes} = require("../../models/statusDes");
const {log} = require("winston");
const _ = require('lodash')
const axios = require("axios");
const {Store} = require("../../models/store");
ProductManage.post('/getAll', async (req, res) => {
    try{
        const data = await Product.find({}, {_id: 0, __v: 0})
        res.status(200).json(data)
    }catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
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
        req.body.status = 1

        const sortedUnitList = _.orderBy( req.body.unitList, ['pricePerUnitSale'], ['desc'])
        console.log(sortedUnitList)
        const newProduct = new Product(req.body)
        await newProduct.save()
        res.status(200).json({status:201,message:'Product Added Successfully'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

ProductManage.post('/addProductFromM3', async (req, res) => {
    try{
        const dataArray = []
        const response = await axios.post('http://58.181.206.159:9814/cms_api/cms_product.php')
        for(let i = 0 ;i <  response.data.length ;i++){
            const idInsert = await Product.findOne({}, {_id: 0, idIndex: 1}).sort({idIndex: -1})
            if (idInsert === null) {
                var idIndex = 1
            } else {
                var idIndex = idInsert.idIndex + 1
            }
            response.data[i].idIndex = idIndex
            response.data[i].status = 1
            const StoreIf = await Product.findOne({id:response.data[i].id})
            if(!StoreIf){
                await Product.create(response.data[i])
            }else{
                const idProductReplace = {
                    idStore: response.data[i].storeId,
                    name:response.data[i].name
                }
                dataArray.push(idProductReplace)
            }

        }
        // const data = await Product.find({}, {_id: 0, __v: 0})
        res.status(200).json({status:201,message:'Product Added Succesfully',additionalData:dataArray})

    }catch (e) {
        console.log(e)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

ProductManage.put('/updateProduct', async (req, res) => {
    try{
        const data = await Product.updateOne({id: req.body.id}, {$set: req.body})
        res.status(200).json({status:201,message:'update '+data.modifiedCount+' row complete'})
    }catch (error){
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

module.exports = ProductManage