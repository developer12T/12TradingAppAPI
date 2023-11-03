const express = require('express')

require('../../configs/connect')
const {Order} = require("../../models/order")
const getOrder = express.Router()


getOrder.get('/getAll', async (req, res) => {
    try {
        const data = await Order.find().exec()
        res.status(200).json(data)

    } catch (e) {
        res.status(500).json(e.message)
    }
})

module.exports = getOrder