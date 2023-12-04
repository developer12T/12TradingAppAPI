const express = require('express')
require('../../configs/connect')
const getProduct = express.Router()
const {Product, Unit} = require('../../models/product')
const axios = require('axios')
const _ = require('lodash')
getProduct.post('/getProductAll', async (req, res) => {
    try {
        const data = await Product.find({}, {_id: 0, id: 1, name: 1, unitList: 1})
        let listObj = []
        const responseData = []
        for (const main of data) {
            for (const list of main.unitList) {
                const dataUnit = await Unit.findOne({idUnit: list.id})
                console.log(dataUnit)
                const listData = {
                    id: list.id,
                    nameThai: dataUnit.nameThai,
                    nameEng: dataUnit.nameEng,
                    pricePerUnitSale: list.pricePerUnitSale,
                    pricePerUnitRefund: list.pricePerUnitRefund,
                    pricePerUnitChange: list.pricePerUnitChange,
                }
                listObj.push(listData)
                // console.log(dataUnit)
            }
            const mainData = {
                id: main.id,
                name: main.name,
                unitList: listObj
            }
            responseData.push(mainData)
            listObj = []
        }

        res.status(200).json(responseData)
    } catch (error) {
        console.log(error)
        res.status(500).json(error.message)
    }
})

getProduct.post('/getProductDetail', async (req, res) => {
    try {
        const data = await Product.findOne({id: req.body.id}, {_id: 0, id: 1, name: 1, unitList: 1})
        const listObj = []
        for (const list of data.unitList) {
            const dataUnit = await Unit.findOne({idUnit: list.id})
            const listData = {
                id: list.id,
                nameThai: dataUnit.nameThai,
                nameEng: dataUnit.nameEng,
                pricePerUnitSale: list.pricePerUnitSale,
                pricePerUnitRefund: list.pricePerUnitRefund,
                pricePerUnitChange: list.pricePerUnitChange,
            }
            listObj.push(listData)
            // console.log(dataUnit)
        }
        const mainData = {
            id: data.id,
            name: data.name,
            unitList: listObj
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

getProduct.get('/getDataOption', async (req, res) => {
    try {
        const data = await Product.find({}, {_id: 0, brand: 1, size: 1,flavour: 1,type:1})
        const type = []
        const brand = []
        const size = []
        const flavour = []
        for(const subData of data){
            type.push(subData.type)
            brand.push(subData.brand)
            size.push(subData.size)
            flavour.push(subData.flavour)
        }
        const op1= _.uniq(type)
        const op2= _.uniq(brand)
        const op3= _.uniq(size)
        const op4= _.uniq(flavour)

        const mainData = {
            type:op1,
            brand:op2,
            size:op3,
            flavour:op4
        }

        res.status(200).json(mainData)
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

getProduct.post('/getProduct', async (req, res) => {
    try {
        const { type, brand, size, flavour } = req.query;

        // Build the filter object based on the provided parameters
        const filter = {};
        if (type) filter['searchData.type'] = type
        if (brand) filter['searchData.brand'] = brand
        if (size) filter['searchData.size'] = size
        if (flavour) filter['searchData.flavour'] = flavour

        const aggregationPipeline = []

        // Conditionally add the $match stage if at least one filter is provided
        if (Object.keys(filter).length > 0) {
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { type: type },
                        { brand: brand },
                        { size: size },
                        { flavour: flavour }
                    ]
                }
            });
        }

        aggregationPipeline.push({
            $project: {
                _id: 0,
                id: 1,
                name: 1,
                unitList: 1
            }
        })

        const data = await Product.aggregate(aggregationPipeline)

        const responseData = data.map(main => ({
            id: main.id,
            name: main.name,
            unitList: main.unitList.map(list => ({
                id: list.id,
                nameThai: list.nameThai,
                nameEng: list.nameEng,
                pricePerUnitSale: list.pricePerUnitSale,
                pricePerUnitRefund: list.pricePerUnitRefund,
                pricePerUnitChange: list.pricePerUnitChange,
            }))
        }))
        res.status(200).json(responseData)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getProduct