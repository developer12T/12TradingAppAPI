const express = require('express')
require('../../configs/connect')
const getProduct = express.Router()
const {Product} = require('../../models/product')
const axios = require('axios')

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
        const data = await Product.findOne({id: req.body.id}, {_id: 0, id: 1, name: 1, skuList: 1})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error.message)
    }

})

getProduct.post('/getDetailUnit', async (req, res) => {
    try {
        const data = await Product.findOne({id: req.body.id}, {_id: 0, id: 1, name: 1, skuList: 1})
        // const sumPrice = 0
        var priceUnit = 0

        for(const list of data.skuList){
            if(list.id === req.body.unitId){
                priceUnit = list.pricePerSku
            }
        }

        const mainData = {
            id:data.id,
            name:data.name,
            unitId:req.body.unitId,
            qty:req.body.qty,
            sumPrice:priceUnit*req.body.qty,
            skuList:data.skuList
        }
        res.status(200).json(mainData)
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getProduct