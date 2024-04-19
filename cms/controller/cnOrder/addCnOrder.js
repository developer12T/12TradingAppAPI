const express = require('express')
require('../../configs/connect')
const {createLog} = require("../../services/errorLog")
const {CnOrder, CartCn} = require("../../models/cnOrder");
const {errResponse} = require("../../services/errorResponse");
const axios = require("axios");
const {Store} = require("../../models/store");
const {available, updateAvailable} = require("../../services/numberSeriers");
const {currentYear} = require("../../utils/utility");
const {Unit} = require("../../models/product");
const addCnOrder = express.Router()
addCnOrder.post('/addCnOrder', async (req, res) => {
    try {
        const data = await CnOrder.find()
        const dataCart = await axios.post(process.env.API_URL_IN_USE + '/cms/cnOrder/getCartCn', {
            area: req.body.area,
            storeId: req.body.storeId
        })
        // console.log(dataCart.data)
        let {area, storeId,noteCnOrder, totalPrice, list, shipping} = dataCart.data
        const storeData = await Store.findOne({storeId})
        const {available, updateAvailable} = require('../../services/numberSeriers')
        const { currentYear,currentdate,currentdateSlash } = require('../../utils/utility')
        const idAvailable = await available(currentYear(),'cnOrder', req.body.zone)
        let listArr = []
        let summary = 0

        for (let listData of list) {
            listData.totalAmount = listData.pricePerUnitRefund * listData.qty
            listData.totalAmount = parseFloat(listData.totalAmount.toFixed(2))
            summary = summary + listData.pricePerUnitRefund * listData.qty
            const dataQtyText = await Unit.findOne({idUnit:listData.unitId})
            listData.qtyText = dataQtyText.nameEng
            listArr.push(listData)
        }
        console.log(listArr)

        const mainData = {
            id: idAvailable,
            orderDate:currentdate(),
            storeId: storeId,
            storeName: storeData.name,
            address: storeData.address,
            taxID: storeData.taxId,
            tel: storeData.tel,
            totalPrice: summary,
            zone: req.body.zone,
            area: req.body.area,
            list: listArr,
            saleCode:req.body.saleCode,
            shipping: {
                address: null,
                dateShip: null,
                note: null
            },
            noteCnOrder,
            status: '10',
            createDate:currentdateSlash()
        }
        console.log(mainData)

        await CnOrder.create(mainData)
        await axios.post(process.env.API_URL_12SERVICE+"/dataCn/addDataCn",mainData)
        // await CartCn.deleteOne({area: req.body.area, storeId: req.body.storeId})

        await updateAvailable('cnOrder', req.body.zone, idAvailable + 1)
        if (data) {
            await createLog('200', req.method, req.originalUrl, res.body, 'add CnOrder Successfully!')

            res.status(200).json({status: 200, message: 'add CnOrder Successfully!'})
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