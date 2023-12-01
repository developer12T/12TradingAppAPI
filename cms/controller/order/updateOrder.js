const express = require('express')

require('../../configs/connect')
const {Order, PreOrder} = require("../../models/order")
const updateOrder = express.Router()

updateOrder.get('/UpdateOrder', async (req, res) => {
    try {
        const data = await Order.find().exec()
        res.status(200).json(data)

    } catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = updateOrder