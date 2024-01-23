const express = require('express')
require('../../configs/connect')
const _ = require("lodash");
const {GiveProduct} = require("../../models/giveProduct");
const {currentdateSlash} = require("../../utils/utility");
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
        const checkGP = await GiveProduct.findOne({area: req.body.area})
        // console.log(checkGP)
        if (checkGP === null) {
            // console.log('ไม่พบ')
            const approve = {
                dateSend: null,
                dateAction: null,
                appPerson: null
            }0
            req.body.id = 1
            req.body.approve = approve
            req.body.updateDate = null
            req.body.createDate = null
            await GiveProduct.create(req.body)
        } else {
            // console.log('พบ')
            await GiveProduct.updateOne({ area: req.body.area }, {
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
        }
        res.status(200).json({status: 200, message: 'Add Product to GiveProduct Successfully!',additionalData:req.body.id})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = addGiveProduct