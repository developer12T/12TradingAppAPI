const express = require('express')
require('../../configs/connect')

const {Refund} = require('../../models/refund')
const {NumberSeries} = require("../../models/numberSeries");
const {available, updateAvailable} = require("../../services/numberSeriers");
const {currentdateDash} = require("../../utils/utility");
const {Product} = require("../../models/product");
const refundProduct = express.Router()

refundProduct.post('/newRefund', async (req, res) => {
    try {
        const {available, updateAvailable} = require('../../services/numberSeriers')
        const {currentdateDash} = require("../../utils/utility")

        const idIn = await Refund.findOne({}, {idIndex: 1}).sort({idIndex: -1}).exec()
        const  idUniq = await Refund.findOne({},{id:1}).sort({id:-1}).exec()

        if (!idIn) {
            var idIndex = 1
        } else {
            var idIndex = idIn.idIndex + 1
        }

        if (!idUniq) {
            var idUnq = currentdateDash().substring(2, 4) + 1
        } else {
            var idUnq = idUniq.id + 1
        }

        const idChange = await available(req.body.numberSeries.type, req.body.numberSeries.zone)
        const idRepair = await available('orderRefund', 'MBE')

        const datalLisrtReturn = []
        const datalLisrtChange = []
        for(const list of req.body.listReturn){
            const dataProduct = await Product.findOne({id:list.id})
            const  mainData = {
                id:dataProduct.id,
                name:dataProduct.name,
                qty:list.qty,
                pricePerQty: dataProduct.pricePerQty,
                totalAmount:list.qty * dataProduct.skuList
            }
            datalLisrtReturn.push(mainData)
            // console.log(dataProduct)
        }

        for(const list of req.body.listChange){
            const dataProduct = await Product.findOne({id:list.id})
            const  mainData = {
                id:dataProduct.id,
                name:dataProduct.name,
                qty:list.qty,
                pricePerQty: dataProduct.pricePerQty,
                totalAmount:list.qty * dataProduct.pricePerQty
            }
            datalLisrtChange.push(mainData)
            // console.log(dataProduct)
        }

        const newData = {
            idIndex: idIndex,
            id: idUnq,
            saleMan: req.body.saleMan,
            storeId: req.body.storeId,
            storeName: req.body.storeName,
            totalReturn:req.body.totalReturn,
            totalChange:req.body.totalChange,
            diffAmount:req.body.diffAmount,
            listReturn: {
                id: idChange,
                list: datalLisrtReturn
            },
            listChange: {
                id: idRepair,
                list: datalLisrtChange
            },
            approve:{
                sender:req.body.saleMan,
                approved:'',
                dateSender:currentdateDash(),
                dateApprove:'',
                status: 'รออนุมัติ'
            },
            refundDate: currentdateDash()
        }
        await Refund.create(newData)
        // await updateAvailable(numberSeries.type, numberSeries.zone, idAvailable + 1)

        res.status(201).json({status: 201, message: 'Open Refund Successfully'})
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = refundProduct

