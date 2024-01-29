const express = require('express')
require('../../../configs/connect')
const getNewGiveProduct = express.Router()
const {GiveProduct} = require("../../../models/giveProduct")
const {createLog} = require("../../../services/errorLog");

getNewGiveProduct.post('/getNew', async (req, res) => {
    try {

        const data = await GiveProduct.find({area: req.body.area, status: '10'}, {
            _id: 0,
            id: 1,
            area:1,
            storeId: 1,
            type: 1,
            totalPrice: 1
        })
        await createLog('200',req.method,req.originalUrl,res.body,'getNew GiveProduct Succesfully')
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({ status: 500, message: error.message })
    }
})

module.exports = getNewGiveProduct
