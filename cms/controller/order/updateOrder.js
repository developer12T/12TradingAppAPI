const express = require('express')

require('../../configs/connect')
const {Order, PreOrder} = require("../../models/order")
const {createLog} = require("../../services/errorLog");
const updateOrder = express.Router()

updateOrder.get('/UpdateOrder', async (req, res) => {
    try {
        const data = await Order.find().exec()
        await createLog('200',req.method,req.originalUrl,res.body,'UpdateOrder Successfully!')
        res.status(200).json(data)
    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = updateOrder