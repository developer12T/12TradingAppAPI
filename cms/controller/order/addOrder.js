const express = require('express')

require('../../configs/connect')
const {Order, PreOrder, Shipping} = require("../../models/order")
const addOrder = express.Router()
var _ = require('lodash')
const {Cart} = require("../../models/saleProduct")
const {User} = require("../../models/user")
const {NumberSeries} = require("../../models/numberSeries")
const {Store} = require("../../models/store")
const {History} = require('../../models/history')
const {currentdateDash} = require("../../utils/utility");
const {diskStorage} = require("multer");

addOrder.post('/newPreOrder', async (req, res) => {
    try {
        const index = await Order.findOne({}, {idIndex: 1}).sort({idIndex: -1})

        if (index === null) {
            var indexPlus = 1
        } else {
            var indexPlus = index + 1
        }

        const numberSeries = await NumberSeries.findOne({type: 'order'}, {'detail.available': 1, _id: 0})
        const availableNumber = numberSeries.detail.available
        const cartData = await Cart.findOne({id: req.body.cartId}, {'list._id': 0})
        const userData = await User.findOne({'description.area': req.body.area}, {})
        const storeData = await Store.findOne({
            idCharecter: cartData.storeId.substring(0, 3),
            idNumber: cartData.storeId.substring(3)
        }, {})

        const listProduct = []

        for (const data of cartData.list) {
            const listData = {
                id: data.id,
                name: data.name,
                qty: data.qty,
                pricePerQty: data.pricePerQty,
                typeQty: data.typeQty,
                totalAmount: data.qty * data.pricePerQty,
                discount: 0
            }
            listProduct.push(listData)
        }

        const mainData = {
            idIndex: indexPlus,
            id: availableNumber + 1,
            saleMan: userData.firstName + ' ' + userData.surName,
            storeId: storeData.idCharecter + storeData.idNumber,
            storeName: storeData.name,
            address: storeData.addressTitle + ' ' + storeData.distric + ' ' + storeData.subDistric + ' ' + storeData.province,
            taxID: storeData.taxId,
            tel: storeData.tel,
            list: listProduct
        }
        await PreOrder.create(mainData)
        await NumberSeries.updateOne({type: 'order'}, {$set: {'detail.available': availableNumber + 1}})
        await History.create({
            type: 'updateNumber',
            collectionName: 'NumberSeries',
            description: `update type:order zone:MBE NumberSeries:${availableNumber} date:${currentdateDash()}`
        })
        res.status(200).json(mainData)
    } catch (e) {
        res.status(500).json(e.message)
    }
})

addOrder.post('/newOrder', async (req, res) => {
    try {
        const data = await PreOrder.findOne({id: req.body.idPreOrder}, {_id: 0, idIndex: 0, __v: 0, 'list._id': 0})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

addOrder.post('/addShipment', async (req, res) => {
    try {
        // const data = await PreOrder.findOne({ id: req.body.idPreOrder }, {_id: 0, idIndex: 0, __v: 0, 'list._id': 0})
        const shlist = {
            id: req.body.idPreOrder,
            address: req.body.address,
            dateShip: req.body.dateShip,
            note: req.body.note
        }

        // const dataList = {
        //     id:data.id,
        //     saleMan: data.saleMan,
        //     storeId: data.storeId,
        //     storeName:data.storeName,
        //     address:data.address,
        //     taxID:data.taxID,
        //     tel:data.tel,
        //     list:data.list,
        //     shipment:shlist
        // }

        await Shipping.create(shlist)

        res.status(200).json({status: 200, message: 'Successfully Add Shipment'})
    } catch (error) {
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

addOrder.post('/getShipment', async (req, res) => {
    try {
        if (req.body.selection === 'All') {
            const data = await Shipping.find()
            res.status(200).json(data)
        } else if (req.body.selection === 'filter') {
            const data = await Shipping.findOne({id: req.body.id})
            res.status(200).json(data)
        } else {
            res.status(501).json({status: 501, message: 'Require selection or id!!!'})
        }
    } catch (error) {
        res.status(500).json({status: 500, message: error.message})
    }
})

module.exports = addOrder