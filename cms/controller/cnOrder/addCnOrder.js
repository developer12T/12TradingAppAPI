const express = require('express')
require('../../configs/connect')
const {createLog} = require("../../services/errorLog")
const {CnOrder, CartCn} = require("../../models/cnOrder");
const {errResponse} = require("../../services/errorResponse");
const axios = require("axios");
const {Store} = require("../../models/store");
const {available, updateAvailable} = require("../../services/numberSeriers");
const addCnOrder = express.Router()
addCnOrder.post('/addCnOrder', async (req, res) => {
    try {
        const data = await CnOrder.find()
        const dataCart = await axios.post(process.env.API_URL_IN_USE + '/cms/cnOrder/getCartCn', {
            area: req.body.area,
            storeId: req.body.storeId
        })
        console.log(dataCart.data)
        let {area, storeId, totalPrice, list, shipping} = dataCart.data
        const storeData = await Store.findOne({storeId})
        const {available, updateAvailable} = require('../../services/numberSeriers')
        const idAvailable = await available('cnOrder', req.body.zone)
        let listArr = []
        let summary = 0

        for (const listData of list) {
            listData.totalAmount = listData.pricePerUnitRefund * listData.qty
            listData.totalAmount = parseFloat(listData.totalAmount.toFixed(2))
            summary = summary + listData.pricePerUnitRefund * listData.qty
            listArr.push(listData)
        }

        const mainData = {
            id: idAvailable,
            storeId: storeId,
            storeName: storeData.name,
            address: storeData.address,
            taxID: storeData.taxId,
            tel: storeData.tel,
            totalPrice:summary,
            list: listArr,
            shipping: {
                address: null,
                dateShip: null,
                note: null
            },
            status: '10'
        }

        await CnOrder.create(mainData)
        await CartCn.deleteOne({area:req.body.area,storeId:req.body.storeId})
        await updateAvailable('cnOrder', req.body.zone, idAvailable + 1)
        if (data) {
            await createLog('200', req.method, req.originalUrl, res.body, 'add CnOrder Successfully!')

            res.status(200).json({status:201,message:'add CnOrder Successfully!'})
            // res.status(200).json(data)
        } else {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            await errResponse(res)
        }
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = addCnOrder