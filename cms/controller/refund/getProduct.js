const express = require('express')
require('../../configs/connect')
const getProduct = express.Router()
const {Product, Unit} = require('../../models/product')
const axios = require('axios')

getProduct.post('/getProductDetail', async (req, res) => {
    try {
        switch (req.body.type) {
            case 'refund':
                // if(req.body.unitId === "0"){
                //     const data = await Product.findOne({id: req.body.id,'unitList.id':'1'}, {_id: 0, id: 1, name: 1, unitList:1})
                //     res.status(200).json(data)
                // }else{
                //     const data = await Product.findOne({id: req.body.id,'unitList.id':'1'}, {_id: 0, id: 1, name: 1,'unitList': {$elemMatch: {'id': req.body.unitId}}})
                //     res.status(200).json(data)
                // }
                const data = await Product.findOne({id: req.body.id,'unitList.id':'1'}, {_id: 0, id: 1, name: 1, unitList:1})
                const listObj = []
                for(const list of  data.unitList){
                    if(list.id === req.body.unitId){
                        var priceUnit = list.pricePerUnitRefund
                    }
                    const dataUnit = await Unit.findOne({idUnit: list.id})
                    const listData = {
                        id: list.id,
                        nameThai: dataUnit.nameThai,
                        nameEng: dataUnit.nameEng,
                        pricePerUnitSale: parseFloat(list.pricePerUnitSale).toFixed(2),
                        pricePerUnitRefund: list.pricePerUnitRefund.toFixed(2),
                        pricePerUnitChange: list.pricePerUnitChange.toFixed(2),
                    }
                    listObj.push(listData)
                }
                // console.log(priceUnit)
                const mainData = {
                    id:data.id,
                    name:data.name,
                    unitId:req.body.unitId,
                    priceUnit:priceUnit.toFixed(2),
                    qty:req.body.qty,
                    sumPrice: (req.body.qty * priceUnit).toFixed(2),
                    list:listObj
                }
                res.status(200).json(mainData)
                break
            case 'change':
                const dataChange = await Product.findOne({id: req.body.id,'unitList.id':'1'}, {_id: 0, id: 1, name: 1, unitList:1})
                const listObjChange = []
                for(const list of  dataChange.unitList){
                    if(list.id === req.body.unitId){
                        var priceUnit = list.pricePerUnitChange
                    }
                    const dataUnit = await Unit.findOne({idUnit: list.id})
                    const listData = {
                        id: list.id,
                        nameThai: dataUnit.nameThai,
                        nameEng: dataUnit.nameEng,
                        pricePerUnitSale: parseFloat(list.pricePerUnitSale).toFixed(2),
                        pricePerUnitRefund: list.pricePerUnitRefund.toFixed(2),
                        pricePerUnitChange: list.pricePerUnitChange.toFixed(2),
                    }
                    listObjChange.push(listData)
                }
                // console.log(priceUnit)
                const mainDataChange = {
                    id:dataChange.id,
                    name:dataChange.name,
                    unitId:req.body.unitId,
                    priceUnit:priceUnit.toFixed(2),
                    qty:req.body.qty,
                    sumPrice: (req.body.qty * priceUnit).toFixed(2),
                    list:listObjChange
                }
                res.status(404).json(mainDataChange)
                break
            default:
                res.status(404).json({status:404,message:'Server Response Not Found'})
                break
        }
    } catch (error) {
        res.status(500).json({status:500,message:error.message})
    }
})

getProduct.post('/getProductDetailUnit', async (req, res) => {
    try {
        switch (req.body.type) {
            case 'refund':
                const data = await Product.findOne({id: req.body.id,'unitList.id':'1'}, {_id: 0, id: 1, name: 1, unitList: 1})
                // const sumPrice = 0
                var priceUnit = 0

                for(const list of data.unitList){
                    if(list.id === req.body.unitId){
                        priceUnit = list.pricePerUnitRefund
                    }
                }

                const mainData = {
                    id:data.id,
                    name:data.name,
                    unitId:req.body.unitId,
                    qty:req.body.qty,
                    sumPrice:priceUnit*req.body.qty,
                    unitList:data.unitList
                }
                res.status(200).json(mainData)
                break

            case 'change' :
                const dataChange = await Product.findOne({id: req.body.id,'unitList.id':'1'}, {_id: 0, id: 1, name: 1, unitList: 1})
                // const sumPrice = 0
                var priceUnit = 0
                for(const list of dataChange.unitList){
                    if(list.id === req.body.unitId){
                        priceUnit = list.pricePerUnitChange
                    }
                }
                const mainDataChange = {
                    id:dataChange.id,
                    name:dataChange.name,
                    unitId:req.body.unitId,
                    qty:req.body.qty,
                    sumPrice:priceUnit*req.body.qty,
                    unitList:dataChange.unitList
                }
                res.status(200).json(mainDataChange)
                break
            default:
                res.status(404).json({status:404,message:'Server Response Not Found'})
                break
        }
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getProduct