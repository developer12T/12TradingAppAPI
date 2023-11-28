const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {Checkin} = require("../../models/route");
const addCart = express.Router()

addCart.post('/addCart', async (req, res) => {
    try {
        var totalPrice_bath = 0
        const priceData = await Cart.findOne({area: req.body.area, storeId: req.body.storeId}, {totalPrice: 1})
        if (priceData === null) {
            for (let i = 0; i < req.body.list.length; i++) {
                console.log(req.body.list[i].id)
                totalPrice_bath = totalPrice_bath + (req.body.list[i].qty * req.body.list[i].pricePerUnitSale)
            }
            console.log(totalPrice_bath)
            req.body.totalPrice = totalPrice_bath
            const addCart = new Cart(req.body)
            await addCart.save()
            res.status(200).json({status:201,message:'AddCart Successfully'})
        } else {

            for (let i = 0; i < req.body.list.length; i++) {
                console.log(req.body.list[i].id)
                totalPrice_bath = totalPrice_bath + (req.body.list[i].qty * req.body.list[i].pricePerUnitSale)
                await Cart.updateOne({
                    area: req.body.area,
                    storeId: req.body.storeId
                }, {$push: {list: req.body.list[i]}})
            }
            var summaryPrice = totalPrice_bath + priceData.totalPrice
            await Cart.updateOne({area: req.body.area, storeId: req.body.storeId}, {$set: {totalPrice: summaryPrice}})
            res.status(200).json({status:201,message:'update Successfully'})
        }
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

addCart.post('/addProductToCart', async (req, res) => {
    try {
        var totalPrice_bath = 0
        const priceData = await Cart.findOne({area: req.body.area, storeId: req.body.storeId}, {totalPrice: 1})
        if (priceData === null) {

            // console.log(req.body.list.id)
            totalPrice_bath = totalPrice_bath + (req.body.list.qty * req.body.list.pricePerQty)

            // console.log(totalPrice_bath)
            req.body.totalPrice = totalPrice_bath
            const addCart = new Cart(req.body)
            await addCart.save()
            res.status(200).json({
                status: 200,
                message: 'addProduct to cart Successfully'
            })
        } else {

            console.log(req.body.list.id)
            totalPrice_bath = totalPrice_bath + (req.body.list.qty * req.body.list.pricePerQty)
            await Cart.updateOne({
                area: req.body.area,
                storeId: req.body.storeId
            }, {$push: {list: req.body.list}})

            var summaryPrice = totalPrice_bath + priceData.totalPrice
            await Cart.updateOne({area: req.body.area, storeId: req.body.storeId}, {$set: {totalPrice: summaryPrice}})
            res.status(200).json({
                status: 200,
                message: 'update Successfully'
            })
        }
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = addCart