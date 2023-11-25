const express = require('express')
require('../../configs/connect')

const { Refund }  = require('../../models/refund')
const refundProduct = express.Router()

refundProduct.post('/newRefund', async (req, res) => {
    try {
        const {currentdateDash} = require("../../utils/utility")
        // const data = await Refund.find().exec()
        const newData = {
            saleMan:req.body.saleMan,
            storeId:req.body.storeId,
            storeName:req.body.storeName,
            listReturn:[
                {
                    id: req.body.listReturn[0].id,
                    qty:req.body.listReturn[0].qty
                }
            ],
            listChange:[],
            refundDate:currentdateDash()
        }
        await Refund.create(newData)
        res.status(200).json(newData)
    } catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = refundProduct

