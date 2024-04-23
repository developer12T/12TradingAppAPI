const express = require('express')
require('../../configs/connect')
const {Order, PreOrder, Shipping} = require('../../models/order')
const addOrder = express.Router()
var _ = require('lodash')
const {Cart} = require('../../models/saleProduct')
const {User} = require('../../models/user')
const {NumberSeries} = require('../../models/numberSeries')
const {Store} = require('../../models/store')
const {History} = require('../../models/history')
const {currentdateDash, spltitString, currentdateSlash, floatConvert} = require('../../utils/utility')
const axios = require('axios')
const {createLog} = require("../../services/errorLog")
const {Product} = require("../../models/product")

addOrder.post('/newOrder', async (req, res) => {
    try {
            const index = await Order.findOne({}, {idIndex: 1}).sort({idIndex: -1})
            // console.log(index)
            if (index === null) {
                var indexPlus = 1
            } else {
                var indexPlus = index.idIndex + 1
            }

            const numberSeries = await NumberSeries.findOne({type: 'order'}, {'detail.available': 1, _id: 0})
            const availableNumber = numberSeries.detail.available
            const cartData = await Cart.findOne({area:req.body.area,storeId:req.body.storeId}, {'list._id': 0})
            const userData = await User.findOne({area: req.body.area}, {})
            const storeData = await Store.findOne({
                storeId: req.body.storeId
            }, {})
            // console.log(cartData.shipping)
            const listProduct = []
            let totalPrice = 0
            for (const data of cartData.list) {
                const totalAmount = data.qty * data.pricePerUnitSale
                totalPrice = totalPrice+totalAmount
                // console.log(data.qty)
                const dataProductGroup = await Product.findOne({id:data.id},{_id:0,group:1})
                const listData = {
                    id: data.id,
                    name: data.name,
                    group: dataProductGroup.group,
                    type:'buy',
                    qty: data.qty,
                    pricePerQty: data.pricePerUnitSale,
                    unitQty: data.unitId,
                    totalAmount:totalAmount ,
                    discount: 0
                }
                listProduct.push(listData)
            }

            const dataPromotion = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/summaryCompare', {
                area: req.body.area,
                storeId: req.body.storeId
            })
            const responseData = dataPromotion.data

            for (const listFreePro of responseData.listFree) {
                for (const listFreeItem of listFreePro.listProduct) {
                    const dataListFree = {
                        id: listFreeItem.productId,
                        name: listFreeItem.productName,
                        // group: listFreeItem.productName,
                        qty: listFreeItem.qty,
                        type: "free",
                        unitQty:listFreeItem.unitQty,
                        nameQty: listFreeItem.unitQtyThai,
                        qtyText: listFreeItem.qty + ' ' + listFreeItem.unitQty,
                        pricePerQty: '0.00',
                        discount: 0,
                        totalAmount: '0.00'
                    }
                    listProduct.push(dataListFree)
                }
            }

            const mainData = {
                idIndex: indexPlus,
                id:
                    + 1,
                saleMan: userData.firstName + ' ' + userData.surName,
                area:req.body.area,
                storeId: storeData.storeId,
                storeName: storeData.name,
                address: storeData.address + ' ' + storeData.distric + ' ' + storeData.subDistric + ' ' + storeData.province,
                taxID: storeData.taxId,
                tel: storeData.tel,
                totalPrice:await floatConvert(totalPrice,2),
                list: listProduct,
                shipping:cartData.shipping,
                status:'10',
                createDate:currentdateSlash(),
                updateDate:null
            }
                await Order.create(mainData)
                //await Cart.deleteOne({area: req.body.area, storeId: req.body.storeId})
        await NumberSeries.updateOne({type: 'order'}, {$set: {'detail.available': availableNumber + 1}})

        const visitResponse = await axios.post(process.env.API_URL_IN_USE+'/cms/route/visit', {
             case: 'sale',
             area: req.body.area,
             storeId: req.body.storeId,
             idRoute: req.body.idRoute,
             latitude:req.body.latitude,
             longtitude:req.body.longtitude,
             note: 'ขายสินค้าแล้ว',
             orderId: mainData.id
             })
        // console.log(fextcapi.data)
        await History.create({
            type: 'updateNumber',
            collectionName: 'NumberSeries',
            description: `update type:order zone:MBE NumberSeries:${availableNumber} date:${currentdateDash()}`
        })
        res.status(200).json({
            order:{
                status:201,
                message:'Create Order Successfully'
            },
            visit:{
                status:201,
                message:`Visit Store : ${req.body.storeId} and OrderId : ${mainData.id} Success`,
                respone:visitResponse.data
            }
        })
        await createLog('200',req.method,req.originalUrl,res.body,'newOrder Successfully!')
        // await Cart.deleteOne({area:req.body.area,storeId:req.body.storeId})
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
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
        await createLog('200',req.method,req.originalUrl,res.body,'Successfully Add Shipment')

        res.status(200).json({status: 200, message: 'Successfully Add Shipment'})
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
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
            await createLog('200',req.method,req.originalUrl,res.body,'getShipment All Successfully!')
            res.status(200).json(data)
        } else if (req.body.selection === 'filter') {
            const data = await Shipping.findOne({id: req.body.id})
            await createLog('200',req.method,req.originalUrl,res.body,'getShipment filter Successfully!')
            res.status(200).json(data)
        } else {
            await createLog('501',req.method,req.originalUrl,res.body,'Require selection or id!!!')
            res.status(501).json({status: 501, message: 'Require selection or id!!!'})
        }
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({status: 500, message: error.message})
    }
})

module.exports = addOrder