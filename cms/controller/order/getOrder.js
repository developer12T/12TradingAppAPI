const express = require('express')

require('../../configs/connect')
const {Order, PreOrder} = require("../../models/order")
const getOrder = express.Router()


getOrder.get('/getAll', async (req, res) => {
    try {
        const data = await Order.find().exec()
        res.status(200).json(data)

    } catch (e) {
        res.status(500).json(e.message)
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
            totalAmountNoVat:(totalAmount/1.07).toFixed(2),
            vat:(totalAmount-(totalAmount/1.07)).toFixed(2),
            summaryAmount:totalAmount.toFixed(2),
            list:data.list
        }

        res.status(200).json(mainData)

    } catch (error) {
        res.status(500).json(
            {
                status: error.stack,
                message: error.message
            }
        )
    }
})

module.exports = getOrder