const express = require('express')

require('../../configs/connect')
const {Order} = require("../../models/order")
const addOrder = express.Router()
var _ = require('lodash');

addOrder.post('/newOrder', async (req, res) => {
    try {
        // const data = await Order.find().exec()
        const data = ['water','banana','cake','popup','popup']

        // const mynewArray = _.chunk(data,3)
        const mynewArray = _.drop([1, 2, 3],2)
        res.status(200).json(mynewArray)

    } catch (e) {
        res.status(500).json(e.message)
    }
})

module.exports = addOrder