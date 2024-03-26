const express = require('express')
require('../../configs/connect')
const getProduct = express.Router()
const {Product, Unit} = require('../../models/product')
const axios = require('axios')
const _ = require('lodash')
const {errResponse} = require("../../services/errorResponse");
const {createLog} = require("../../services/errorLog");
const { slicePackSize } = require('../../utils/utility')
getProduct.post('/getProductAll', async (req, res) => {
    try {
        const data = await Product.find({}, {_id: 0, id: 1, name: 1})
        if(data.length > 0){
            const responseData = []
            for (const main of data) {
                const mainData = {
                    id: main.id,
                    nameDetail: main.name,
                }
                responseData.push(mainData)
            }
            const newData =  responseData.map(item =>  {
                item.name = slicePackSize( item.nameDetail )
                return item;
            });

            await createLog('200',req.method,req.originalUrl,res.body,'getProductAll successfully')
            res.status(200).json(newData)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'No Data')
            await errResponse(res)
        }

    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json(error.message)
    }
})

getProduct.post('/getProductDetail', async (req, res) => {
    try {
        const data = await Product.findOne({id: req.body.id}, {_id: 0, id: 1, name: 1, unitList: 1})
        if(data){
            const listObj = []
            for (const list of data.unitList) {
                const dataUnit = await Unit.findOne({idUnit: list.id})
                const listData = {
                    id: list.id,
                    nameThai: dataUnit.nameThai,
                    nameEng: dataUnit.nameEng,
                    pricePerUnitSale: parseFloat(list.pricePerUnitSale).toFixed(2),
                    pricePerUnitRefund: list.pricePerUnitRefund,
                    pricePerUnitChange: list.pricePerUnitChange,
                }
                listObj.push(listData)
                // console.log(dataUnit)
            }
            const mainData = {
                id: data.id,
                name: slicePackSize(data.name),
                nameDetail: data.name,
                unitList: listObj
            }
            await createLog('200',req.method,req.originalUrl,res.body,'getProductDetail successfully')
            res.status(200).json(mainData)
        }else {
            await createLog('200',req.method,req.originalUrl,res.body,'No Data')
            await errResponse(res)
        }

    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json(error.message)
    }
})

getProduct.post('/getProductDetailUnit', async (req, res) => {
    try {
        const data = await Product.findOne({id: req.body.id}, {_id: 0, id: 1, name: 1, unitList: 1})
        if (data){
            var priceUnit = 0
            const listObj = []
            for (const list of data.unitList) {
                if (list.id === req.body.unitId) {
                    priceUnit = list.pricePerUnitSale
                }
                const dataUnit = await Unit.findOne({idUnit: list.id})
                const listData = {
                    id: list.id,
                    nameThai: dataUnit.nameThai,
                    nameEng: dataUnit.nameEng,
                    pricePerUnitSale: parseFloat(list.pricePerUnitSale).toFixed(2),
                    pricePerUnitRefund: list.pricePerUnitRefund,
                    pricePerUnitChange: list.pricePerUnitChange,
                }
                listObj.push(listData)
            }
            const mainData = {
                id: data.id,
                name: slicePackSize(data.name),
                nameDetail: data.name,
                unitId: req.body.unitId,
                qty: req.body.qty,
                sumPrice: parseFloat(priceUnit * req.body.qty).toFixed(2),
                unitList: listObj
            }
            await createLog('200',req.method,req.originalUrl,res.body,'getProductDetailUnit successfully')
            res.status(200).json(mainData)

        }else {
            await createLog('200',req.method,req.originalUrl,res.body,'No Data')
            await errResponse(res)
        }

    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

// getProduct.get('/getDataOption', async (req, res) => {
//     try {
//         const data = await Product.find({}, {_id: 0, brand: 1, size: 1, flavour: 1, group: 1})
//         if (data.length > 0){
//             const group = []
//             const brand = []
//             const size = []
//             const flavour = []
//             for (const subData of data) {
//                 group.push(subData.group)
//                 brand.push(subData.brand)
//                 size.push(subData.size)
//                 flavour.push(subData.flavour)
//             }
//             const op1 = _.uniq(group)
//             const op2 = _.uniq(brand)
//             const op3 = _.uniq(size)
//             const op4 = _.uniq(flavour)

//             const mainData = {
//                 group: op1,
//                 brand: op2,
//                 size: op3,
//                 flavour: op4
//             }
//             await createLog('200',req.method,req.originalUrl,res.body,'getDataOption successfully')
//             res.status(200).json(mainData)
//         }else{
//             await createLog('200',req.method,req.originalUrl,res.body,'No Data')
//             await errResponse(res)
//         }

//     } catch (error) {
//         await createLog('500',req.method,req.originalUrl,res.body,error.message)
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         })
//     }
// })

getProduct.post('/getDataOption', async (req, res) => {
    try {
        // let dataSearch = req.body

        for (const key in req.body) {
            if (req.body[key] === "") {
                delete req.body[key];
            }
        }
        
        const data = await Product.find(req.body, {_id: 0, brand: 1, size: 1, flavour: 1, group: 1})
        if (data.length > 0){
            const group = []
            const brand = []
            const size = []
            const flavour = []
            for (const subData of data) {
                group.push(subData.group)
                brand.push(subData.brand)
                size.push(subData.size)
                flavour.push(subData.flavour)
            }
            const op1 = _.uniq(group)
            const op2 = _.uniq(brand)
            const op3 = _.uniq(size)
            const op4 = _.uniq(flavour)

            const mainData = {
                group: op1,
                brand: op2,
                size: op3,
                flavour: op4
            }
            await createLog('200',req.method,req.originalUrl,res.body,'getDataOption successfully')
            res.status(200).json(mainData)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'No Data')
            await errResponse(res)
        }

    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})


getProduct.post('/getProduct', async (req, res) => {
    try {

        for (const key in req.body) {
            if (req.body[key] === "") {
                delete req.body[key];
            }
        }
        // console.log(req.body);
        const data = await Product.find(req.body, {_id: 0, idIndex: 0, __v: 0, status: 0})
        // console.log(data);
        if (data.length > 0){
            const responseData = data.map(main => ({
                id: main.id,
                name: slicePackSize(main.name),
                nameDetail: main.name,
                unitList: main.unitList.map(list => ({
                    id: list.id,
                    nameThai: list.nameThai,
                    nameEng: list.nameEng,
                    pricePerUnitSale: parseFloat(list.pricePerUnitSale).toFixed(2),
                    pricePerUnitRefund: list.pricePerUnitRefund,
                    pricePerUnitChange: list.pricePerUnitChange,
                }))
            }))
            await createLog('200',req.method,req.originalUrl,res.body,'getProduct successfully')
            res.status(200).json(responseData)
        }else {
            await createLog('200',req.method,req.originalUrl,res.body,'No Data')
            await errResponse(res)
        }
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getProduct