const express = require('express')
require('../../configs/connect')
const {createLog} = require("../../services/errorLog")
const {CnOrder, CartCn} = require("../../models/cnOrder")
const {errResponse} = require("../../services/errorResponse")
const axios = require("axios")
const {Store} = require("../../models/store")
const {available, updateAvailable} = require("../../services/numberSeriers")
const {currentYear, currentdate, currentdateSlash} = require("../../utils/utility")
const {Unit, Product} = require("../../models/product")
const jwt = require('jsonwebtoken')
const {Order} = require("../../models/order");
const addCnOrder = express.Router()

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 401,
            message: 'Authorization token is missing or invalid'
        });
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
        return res.status(401).json({ status: '401', message: 'Authorization token is missing' })
    }
    if(token !== process.env.TOKEN_KEY_ACCESS){
        return res.status(401).json({ status: '401', message: 'Authorization invalid' })
    }
    next()
}

addCnOrder.post('/addCnOrder', async (req, res) => {
    try {
        const data = await CnOrder.find()
        const dataCart = await axios.post(process.env.API_URL_IN_USE + '/cms/cnOrder/getCartCn', {
            area: req.body.area,
            storeId: req.body.storeId
        })
        // console.log(dataCart.data)
        let {area, storeId, noteCnOrder, totalPrice, list, shipping} = dataCart.data
        const storeData = await Store.findOne({storeId})
        const {available, updateAvailable} = require('../../services/numberSeriers')
        const {currentYear, currentdate, currentdateSlash} = require('../../utils/utility')
        const idAvailable = await available(currentYear(), 'cnOrder', req.body.zone)
        let listArr = []
        let summary = 0
        console.log(list)
        for (let listData of list) {
            listData.totalAmount = listData.pricePerUnitRefund * listData.qty
            listData.totalAmount = parseFloat(listData.totalAmount.toFixed(2))
            summary = summary + listData.pricePerUnitRefund * listData.qty
            const dataQtyText = await Unit.findOne({idUnit: listData.unitId})
            listData.qtyText = dataQtyText.nameEng
            listArr.push(listData)
        }
        console.log(listArr)

        const mainData = {
            orderNo: idAvailable,
            orderDate: currentdate(),
            storeId: storeId,
            storeName: storeData.name,
            address: storeData.address,
            taxID: storeData.taxId,
            tel: storeData.tel,
            totalPrice: summary,
            zone: req.body.zone,
            area: req.body.area,
            list: listArr,
            saleCode: req.body.saleCode,
            shipping: {
                address: null,
                dateShip: null,
                note: null
            },
            noteCnOrder,
            status: '10',
            createDate: currentdateSlash(),
            refOrder:req.body.refOrder
        }
        console.log(mainData)

        const dataCheck = await axios.post(process.env.API_URL_12SERVICE + "/dataCn/checkOrderReplace", {orderNo:mainData.orderNo})
        if(dataCheck.data.statusCheck === 0){
            await CnOrder.create(mainData)
            await axios.post(process.env.API_URL_12SERVICE + "/dataCn/addDataCn", mainData)
            await updateAvailable(currentYear(),'cnOrder', req.body.zone ,idAvailable + 1)
            await createLog('200', req.method, req.originalUrl, res.body, 'add CnOrder Successfully!')

            res.status(200).json({status: 200, message: 'add CnOrder Successfully!'})
        }else{
            await createLog('200', req.method, req.originalUrl, res.body, 'CnOrder has replace Successfully!')

            res.status(200).json({status: 200, message: 'CnOrder has replace Successfully!'})
        }
        // await CartCn.deleteOne({area: req.body.area, storeId: req.body.storeId}) ปิดไว้เพื่อเทส
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

addCnOrder.post('/addCnOrderFromOrder', async (req, res) => {
    try {
        let {orderNo, noteCnOrder, saleCode} = req.body
        if (orderNo && noteCnOrder) {
            const orderRef = await Order.findOne({ orderNo: orderNo })
            const { available, updateAvailable } = require('../../services/numberSeriers')
            const { currentYear, currentdate, currentdateSlash } = require('../../utils/utility')
            const idAvailable = await available(currentYear(), 'cnOrder', req.body.zone)
            let listArr = [];
            for (let listData of orderRef.list) {
                const dataQtyText = await Unit.findOne({ idUnit: listData.unitQty });
                const dataProduct = await Product.findOne({ id: listData.id, unitList: { $elemMatch: { id: listData.unitQty } } }, { 'unitList.$': 1 });
                console.log('cn',dataProduct)
                let listObj = {
                    id: listData.id,
                    name: listData.name,
                    qty: listData.qty,
                    unitId: listData.unitQty,
                    pricePerUnitRefund: dataProduct.unitList[0].pricePerUnitRefund,
                    qtyText: dataQtyText.nameEng,
                    totalAmount: listData.totalAmount,
                    note: ""
                };
                listArr.push(listObj)
            }

            const mainData = {
                orderNo: idAvailable,
                orderDate: currentdate(),
                storeId: orderRef.storeId,
                storeName: orderRef.storeName,
                address: orderRef.address,
                taxID: orderRef.taxId,
                tel: orderRef.tel,
                totalPrice: orderRef.totalPrice,
                zone: orderRef.area.slice(0, 2),
                area: orderRef.area,
                list: listArr,
                saleCode,
                shipping: {
                    address: null,
                    dateShip: null,
                    note: null
                },
                noteCnOrder,
                status: '10',
                createDate: currentdateSlash(),
                refOrder: orderRef.orderNo
            };

            await CnOrder.create(mainData)
            await axios.post(process.env.API_URL_12SERVICE + "/dataCn/addDataCn", mainData)
            await Order.updateOne({ orderNo: orderRef.orderNo }, { status: "99" })
            await updateAvailable(currentYear(), 'cnOrder', req.body.zone, idAvailable + 1)
            await createLog('200', req.method, req.originalUrl, res.body, 'add CnOrder Successfully!')
            res.status(200).json({ status: '200', message: 'add CnOrder Successfully!' })
            return;
        } else {
            res.status(500).json({ status: '500', message: 'require req.body!!' })
            return
        }
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        });
        return
    }
});

addCnOrder.post('/updateStatusCnOrder',verifyToken, async (req, res) => {
    try {
        let {id, status} = req.body
        if (id && status) {
            await CnOrder.updateOne({ id }, { status })
            res.status(200).json({status: '200', message: 'Update Status Successfully'})
        } else {
            res.status(500).json({status: '500', message: 'require req.body!!'})
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