const express = require('express')
require('../../configs/connect')
const _ = require("lodash");
const {GiveProduct} = require("../../models/giveProduct");
const {currentdateSlash} = require("../../utils/utility");
const {createLog} = require("../../services/errorLog");
const addGiveProduct = express.Router()
addGiveProduct.post('/add', async (req, res) => {
    try {
        const {currentDateDDMMYY,currentdateDash} = require('../../utils/utility')
        const approve = {
            dateSend: currentDateDDMMYY(),
            dateAction: null,
            appPerson: null
        }
        req.body.approve = approve
        req.body.updateDate = null
        req.body.createDate = currentdateDash()
        // const check = await
        await GiveProduct.updateOne({area:req.body.area},{$set:req.body})
        res.status(200).json({status: 200, message: 'Add GiveProduct Successfully!'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

addGiveProduct.post('/addProductToGP', async (req, res) => {
    try {
        const { available,updateAvailable } = require('../../services/numberSeriers')
        const checkGP = await GiveProduct.findOne({area: req.body.area})
        let dataId = 0
        let message = 'Add Product to GiveProduct Successfully!'
        let checkRes = 0
        if (checkGP === null) {
            const approve = {
                dateSend: null,
                dateAction: null,
                appPerson: null
            }
             dataId = await available('giveProduct',req.body.area.slice(0, 2))
            req.body.id = req.body.area.slice(0, 2) + dataId
            req.body.approve = approve
            req.body.updateDate = null
            req.body.createDate = null
            req.body.totalPrice = req.body.list.reduce((accumulator , item) => {return accumulator + item.totalPrice}, 0)
            await GiveProduct.create(req.body)
           await updateAvailable('giveProduct','zone',dataId+1)
            dataId =  req.body.area.slice(0, 2)+dataId
        } else {
            if(req.body.idGiveProduct !== ''){
                let dataTotal = await GiveProduct.findOne({area:req.body.area,id:req.body.idGiveProduct},{totalPrice:1,_id:0})
                console.log(dataTotal)
                await GiveProduct.updateOne({ area: req.body.area,id:req.body.idGiveProduct }, {
                    $set:{
                        totalPrice:dataTotal.totalPrice + req.body.list.reduce((accumulator, item) => { return accumulator + item.totalPrice }, 0)
                    },
                    $push: {
                        list: {
                            id: req.body.list[0].id,
                            name: req.body.list[0].name,
                            qty: req.body.list[0].qty,
                            unitQty: req.body.list[0].unitQty,
                            PricePerQty: req.body.list[0].PricePerQty,
                            totalPrice: req.body.list[0].totalPrice
                        }
                    }
                })
                 dataId = req.body.idGiveProduct
            }else{
                checkRes = 1
                message = 'idGiveProduct not found. Please send idGiveProduct req.body!'
            }
        }

        if(checkRes === 1){
            res.status(500).json({status: 500, message:message})
        }else{
            res.status(200).json({status: 200, message:message ,idGiveProduct:dataId})
        }
    } catch (e) {
        console.log(e)
        await createLog('500',res.method,req.originalUrl,res.body,e.stack)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = addGiveProduct