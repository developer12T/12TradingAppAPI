const express = require('express')
require('../../configs/connect')

const { Refund }  = require('../../models/refund')
const refundProduct = express.Router()

refundProduct.post('/newRefund', async (req, res) => {
    try {
        const {currentdateDash} = require("../../utils/utility")

        const idIn = await Refund.findOne({},{idIndex:1}).sort({idIndex:-1}).exec()
        if(!idIn){
            var idIndex = 1
        }else{
            var idIndex = idIn.idIndex+1
        }
        console.log(idIn)

        const newData = {
            idIndex:idIndex,
            id:'9999999',
            saleMan:req.body.saleMan,
            storeId:req.body.storeId,
            storeName:req.body.storeName,
            listReturn:[
                {
                    id: req.body.listReturn[0].id,
                    qty:req.body.listReturn[0].qty
                }
            ],
            status:"รออนุมัติ",
            listChange:[],
            refundDate:currentdateDash()
        }
        await Refund.create(newData)
        res.status(201).json({status:201,message:'Open Refund Successfully'})
    } catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = refundProduct

