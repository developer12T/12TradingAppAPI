const express = require('express')
require('../../configs/connect')
const {Order} = require("../../models/order");
const getDashBoard = express.Router()
getDashBoard.get('/getMain', async (req, res) => {
    try {
        const data = await Order.find()
        res.status(200).json({ count:data.length})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getDashBoard