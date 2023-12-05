const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {Store} = require("../../models/store")
const {Unit} = require("../../models/product");

const getCart = express.Router()

getCart.post('/getCart', async (req, res) => {
    try {
        const data = await Cart.find({area: req.body.area, storeId: req.body.storeId})
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})
getCart.post('/getCartToShow', async (req, res) => {
    try {
        var totalAmount = 0
        const data = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        const data_arr = []
        for (let i = 0; i < data.list.length; i++) {

            const detail_product = await Unit.findOne({idUnit:data.list[i].unitId})
            const list_obj = {
                id: data.list[i].id,
                name: data.list[i].name,
                qty: data.list[i].qty,
                unitId:data.list[i].unitId,
                unitTypeThai:detail_product.nameThai,
                unitTypeEng:detail_product.nameEng,
                summaryPrice: data.list[i].pricePerUnitSale * data.list[i].qty
            }
            totalAmount = totalAmount + (data.list[i].pricePerUnitSale * data.list[i].qty)
            data_arr.push(list_obj)
        }

        const storeData = await Store.findOne({
            idCharecter: req.body.storeId.substring(0, 3), idNumber: req.body.storeId.substring(3)
        }, {})
        const mainData = {
            idCart: data.id,
            storeId: storeData.idCharecter + storeData.idNumber,
            name: storeData.name,
            totalQuantity: data_arr.length,
            totalAmount:  parseFloat(totalAmount).toFixed(2),
            list: data_arr
        }
        res.status(200).json(mainData)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getCart