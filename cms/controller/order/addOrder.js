const express = require('express')
require('../../configs/connect')
const { Order, PreOrder, Shipping } = require('../../models/order')
const addOrder = express.Router()
var _ = require('lodash')
const { Cart } = require('../../models/saleProduct')
const { User } = require('../../models/user')
const { NumberSeries } = require('../../models/numberSeries')
const { Store } = require('../../models/store')
const { History } = require('../../models/history')
const { currentdateDash, spltitString, currentdateSlash, floatConvert } = require('../../utils/utility')
const axios = require('axios')
const { createLog } = require("../../services/errorLog")
const { Product } = require("../../models/product")

addOrder.post('/newOrder', async (req, res) => {
    try {
        const preOrderResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/getPreOrder`, {
            area: req.body.area,
            storeId: req.body.storeId,
            saleCode: req.body.saleCode
        });
        const preOrderData = preOrderResponse.data;

        console.log('PreOrder data:', preOrderData);

        const { area, storeId, idRoute, warehouse, note, latitude, longtitude } = req.body;
        const { saleMan, storeName, address, taxID, tel, totalAmount, discount, list, listFree, shippingAddress, shippingDate } = preOrderData;

        const numberSeries = await NumberSeries.findOne({ type: 'order' }, { 'detail.available': 1, _id: 0 });
        const availableNumber = numberSeries ? numberSeries.detail.available : 0;
        const orderNo = (availableNumber + 1).toString();

        if (!Array.isArray(list) || !Array.isArray(listFree) || (list.length === 0 && listFree.length === 0)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid or missing product data.'
            });
        }

        const mainData = {
            orderNo: orderNo,
            saleMan: saleMan,
            saleCode: req.body.saleCode,
            area: area,
            storeId: storeId,
            storeName: storeName,
            address: address,
            taxID: taxID,
            tel: tel,
            warehouse: warehouse,
            note: req.body.note,
            latitude: req.body.latitude,
            longtitude: req.body.longtitude,
            totalPrice: parseFloat(parseFloat(totalAmount).toFixed(2)),
            totalDiscount: parseFloat(parseFloat(discount).toFixed(2)),
            list: [...list, ...listFree],
            shipping: {
                address: shippingAddress,
                dateShip: shippingDate,
                note: ''
            },
            status: '10',
            createDate: currentdateSlash(),
            updateDate: null
        };

        const createdOrder = await Order.create(mainData);

        await Cart.deleteOne({ area: req.body.area, storeId: req.body.storeId });

        await NumberSeries.updateOne({ type: 'order' }, { $set: { 'detail.available': availableNumber + 1 } });

        const visitResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/route/visit`, {
            case: 'sale',
            area: req.body.area,
            storeId: req.body.storeId,
            idRoute: req.body.idRoute,
            note: 'ขายสินค้าแล้ว',
            orderId: orderNo
        });

        res.status(200).json({
            status: 201,
            message: 'Create Order Successfully',
            order: createdOrder,
            visit: visitResponse.data
        });
        // res.status(200).json(mainData)
        await createLog('200', req.method, req.originalUrl, res.body, 'newOrder Successfully!');
    } catch (error) {
        console.log(error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

// addOrder.post('/newOrder', async (req, res) => {
//     try {
//         const preOrderResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/getPreOrder`, {
//             area: req.body.area,
//             storeId: req.body.storeId,
//             saleCode: req.body.saleCode
//         });
//         const preOrderData = preOrderResponse.data;

//         console.log('PreOrder data:', preOrderData);

//         const { area, storeId, idRoute, warehouse } = req.body;
//         const { saleMan, storeName, address, taxID, tel, totalAmount, discount, list, listFree, shippingAddress, shippingDate } = preOrderData;

//         const seriesResponse = await axios.post('http://192.168.2.97:8383/M3API/OrderManage/Order/getNumberSeries', {
//             series: "ฃ",
//             seriestype: "01",
//             companycode: 410,
//             seriesname: "0"
//         });

//         const seriesData = seriesResponse.data[0];
//         const availableNumber = seriesData.lastno;
//         const orderNo = (availableNumber + 1).toString();

//         if (!Array.isArray(list) || !Array.isArray(listFree) || (list.length === 0 && listFree.length === 0)) {
//             return res.status(400).json({
//                 status: 400,
//                 message: 'Invalid or missing product data.'
//             });
//         }

//         const mainData = {
//             orderNo: orderNo,
//             saleMan: saleMan,
//             saleCode: req.body.saleCode,
//             area: area,
//             storeId: storeId,
//             storeName: storeName,
//             address: address,
//             taxID: taxID,
//             tel: tel,
//             warehouse: warehouse,
//             totalPrice: parseFloat(parseFloat(totalAmount).toFixed(2)),
//             totalDiscount: parseFloat(parseFloat(discount).toFixed(2)),
//             list: [...list, ...listFree],
//             shipping: {
//                 address: shippingAddress,
//                 dateShip: shippingDate,
//                 note: ''
//             },
//             status: '10',
//             createDate: currentdateSlash(),
//             updateDate: null
//         };

//         const createdOrder = await Order.create(mainData);

//         await Cart.deleteOne({ area: req.body.area, storeId: req.body.storeId });

//         await axios.post('http://192.168.2.97:8383/M3API/OrderManage/Order/updateNumberRunning', {
//             lastno: orderNo,
//             series: "ฃ",
//             seriesname: "0",
//             seriestype: "01",
//             companycode: 410
//         });

//         const visitResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/route/visit`, {
//             case: 'sale',
//             area: req.body.area,
//             storeId: req.body.storeId,
//             idRoute: req.body.idRoute,
//             note: 'ขายสินค้าแล้ว',
//             orderId: orderNo
//         });

//         res.status(200).json({
//             status: 201,
//             message: 'Create Order Successfully',
//             order: createdOrder,
//             visit: visitResponse.data
//         });
//         await createLog('200', req.method, req.originalUrl, res.body, 'newOrder Successfully!');
//     } catch (error) {
//         console.log(error);
//         await createLog('500', req.method, req.originalUrl, res.body, error.message);
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// });

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
        await createLog('200', req.method, req.originalUrl, res.body, 'Successfully Add Shipment')

        res.status(200).json({ status: 200, message: 'Successfully Add Shipment' })
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

addOrder.post('/getShipment', async (req, res) => {
    try {
        if (req.body.selection === 'All') {
            const data = await Shipping.find()
            await createLog('200', req.method, req.originalUrl, res.body, 'getShipment All Successfully!')
            res.status(200).json(data)
        } else if (req.body.selection === 'filter') {
            const data = await Shipping.findOne({ id: req.body.id })
            await createLog('200', req.method, req.originalUrl, res.body, 'getShipment filter Successfully!')
            res.status(200).json(data)
        } else {
            await createLog('501', req.method, req.originalUrl, res.body, 'Require selection or id!!!')
            res.status(501).json({ status: 501, message: 'Require selection or id!!!' })
        }
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({ status: 500, message: error.message })
    }
})

module.exports = addOrder