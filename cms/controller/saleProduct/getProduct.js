const express = require('express')
require('../../configs/connect')
const getProduct = express.Router()
const {Product, Unit} = require('../../models/product')
const axios = require('axios')

getProduct.post('/getProductAll', async (req, res) => {
    try {
        const data = await Product.find({}, {_id: 0, id: 1, name: 1, skuList: 1})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error.message)
    }
})

getProduct.post('/getProductDetail', async (req, res) => {
    try {
        const data = await Product.findOne({id: req.body.id}, {_id: 0, id: 1, name: 1, unitList: 1})
        const listObj = []
         for(const list of data.unitList){
             const dataUnit = await Unit.findOne({idUnit:list.id})
             const listData = {
                 id:list.id,
                 nameThai:dataUnit.nameThai,
                 nameEng:dataUnit.nameEng,
                 pricePerUnitSale: list.pricePerUnitSale,
                 pricePerUnitRefund:list.pricePerUnitRefund,
                 pricePerUnitChange: list.pricePerUnitChange,
             }
             listObj.push(listData)
             // console.log(dataUnit)
         }
         const mainData = {
            id:data.id,
            name:data.name,
            unitList:listObj
         }
        res.status(200).json(mainData)
    } catch (error) {
        res.status(500).json(error.message)
    }
})

getProduct.post('/getProductDetailUnit', async (req, res) => {
    try {
        const data = await Product.findOne({id: req.body.id}, {_id: 0, id: 1, name: 1, unitList: 1})
        // const sumPrice = 0
        var priceUnit = 0

        for (const list of data.unitList) {
            if (list.id === req.body.unitId) {
                priceUnit = list.pricePerUnitSale
            }
        }

        const mainData = {
            id: data.id,
            name: data.name,
            unitId: req.body.unitId,
            qty: req.body.qty,
            sumPrice: priceUnit * req.body.qty,
            unitList: data.unitList
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