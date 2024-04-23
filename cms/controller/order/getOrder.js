const express = require('express')

require('../../configs/connect')
const {Order, PreOrder} = require("../../models/order")
const {Unit} = require("../../models/product")
const {createLog} = require("../../services/errorLog");
const {statusDes} = require("../../models/statusDes");
const {getNameStatus, slicePackSize} = require("../../utils/utility");
const getOrder = express.Router()


getOrder.get('/getAll', async (req, res) => {
    try {
        const data = await Order.find().exec()
        await createLog('200',req.method,req.originalUrl,res.body,'getAll Order Successfully!')
        res.status(200).json(data)

    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

getOrder.post('/getMain', async (req, res) => {
    try {
        const { area } = req.body
        const data = await Order.find({area},{_id:0,__v:0,idIndex:0}).sort({id:-1})
        if(data.length > 0){
            const mainData = []
            for(let list of data){
                // const nameSt = await statusDes.findOne({type:"order",list: {$elemMatch:{'id':list.status}}},{list:1})
                mainData.push({
                    orderDate:list.createDate,
                    number:list.id,
                    name:list.storeName,
                    totalPrice:list.totalPrice,
                    status:list.status,
                    // statusText: await getNameStatus('order',list.status).name
                })
            }
            await createLog('200',req.method,req.originalUrl,res.body,'getAll Order Successfully!')
            res.status(200).json(data)
        }else{
            await createLog('204',req.method,req.originalUrl,res.body,'No Data')
            res.status(200).json({status:204,message:'No Data'})
        }
    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

getOrder.post('/getAllPreOrder', async (req, res) => {
    try {
        const data = await PreOrder.findOne({id: req.body.id},{'list._id':0,__v:0,_id:0})
        var totalAmount =  0
        for (const listdata of data.list){
            totalAmount =   totalAmount+listdata.totalAmount
            // console.log(totalAmount)
        }

        const mainData = {
            id: data.id,
            saleMan: data.saleMan,
            storeId: data.storeId,
            storeName: data.storeName,
            address: data.address,
            taxID: data.taxID,
            tel: data.tel,
            totalAmount:totalAmount.toFixed(2),
            discount: '0.00',
            totalAmountNoVat:(totalAmount/1.07).toFixed (2),
            vat:(totalAmount-(totalAmount/1.07)).toFixed(2),
            summaryAmount:totalAmount.toFixed(2),
            list:data.list
        }
        await createLog('200',req.method,req.originalUrl,res.body,'getAllPreOrder Successfully!')
        res.status(200).json(mainData)
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json(
            {
                status: 500,
                message: error.message
            }
        )
    }
})

getOrder.post('/getDetail', async (req, res) => {
    try {
        const { orderNo } = req.body
        const data = await Order.findOne({orderNo},{_id:0,__v:0,idIndex:0}).sort({orderNo:-1})
        if(data) {
            const data_list = []
            for (let i = 0; i < data.list.length; i++) {
                const detail_product = await Unit.findOne({idUnit: data.list[i].unitQty})
                const list_obj = {
                    id: data.list[i].id,
                    name: slicePackSize(data.list[i].name),
                    nameDetail: data.list[i].name,
                    qtyText: data.list[i].qty + ' ' + detail_product.nameThai,
                    qty: data.list[i].qty,
                    unitId: data.list[i].unitId,
                    unitTypeThai: detail_product.nameThai,
                    unitTypeEng: detail_product.nameEng,
                    summaryPrice: parseFloat(data.list[i].pricePerQty * data.list[i].qty).toFixed(2)
                }
                data_list.push(list_obj)
            }
            const mainData = {
                orderDate:data.createDate,
                orderNo:data.orderNo,
                name:data.storeName,
                totalPrice:data.totalPrice,
                status:data.status,
                list: data_list
            }
            await createLog('200',req.method,req.originalUrl,res.body,'get Order Detail Successfully!')
            res.status(200).json(mainData)
        }else{
            await createLog('204',req.method,req.originalUrl,res.body,'No Data')
            res.status(200).json({status:204,message:'No Data'})
        }
    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = getOrder