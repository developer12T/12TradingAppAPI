const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {Checkin} = require("../../models/route");
const getCart = express.Router()

getCart.post('/getCart', async (req, res) => {
    try {
        const data = await Cart.find({area: req.body.area, storeId: req.body.storeId})
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json(e)
    }
})
getCart.post('/getCartToShow', async (req, res) => {
    try {
        const data = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        const data_arr = []
        for(let i = 0;i < data.list.length; i++) {
            const data_obj = {
                name:data.list[i].name,
                qty:data.list[i].qty + data.list[i].typeQty,
                summaryPrice: data.list[i].pricePerQty * data.list[i].qty
            }
            data_arr.push(data_obj)
        }
        var storeName = 'ร้านทดสอบระบบ'
        data_arr.push(storeName)
        res.status(200).json(data_arr)
    } catch (e) {
        res.status(500).json(e)
    }
})


module.exports = getCart