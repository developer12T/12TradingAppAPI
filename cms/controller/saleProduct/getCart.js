const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {Checkin} = require("../../models/route");
const getCart = express.Router()

getCart.post('/getCart', async (req, res) => {
    try {
        const data = await Cart.find({area:req.body.area,storeId:req.body.storeId })
            res.status(200).json(data)
    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = getCart