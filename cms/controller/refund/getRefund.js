const express = require('express')
require('../../configs/connect')

const {Refund, CartRefund} = require('../../models/refund')
const {NumberSeries} = require("../../models/numberSeries")
const {available, updateAvailable} = require("../../services/numberSeriers")
const {Product} = require("../../models/product")
const {Store} = require("../../models/store")
const getRefundProduct = express.Router()
const _ = require('lodash')
const {currentdateDash} = require("../../utils/utility");
getRefundProduct.post('/getPreRefund', async (req, res) => {
    try {
        const {currentdateDash} = require("../../utils/utility")
        const data = await CartRefund.findOne({area: req.body.area, storeId: req.body.storeId, type: 'refund'})
        const data2 = await CartRefund.findOne({area: req.body.area, storeId: req.body.storeId, type: 'change'})
        const dataStore = await Store.findOne({
           storeId:req.body.storeId
        })

        const totalReturn = _.sumBy(data.list, 'sumPrice')
        const totalChange = _.sumBy(data2.list, 'sumPrice')

        const mainData = {
            storeId: req.body.storeId,
            storeName: dataStore.name,
            totalReturn: totalReturn,
            totalChange: totalChange,
            diffAmount: totalReturn-totalChange,
            refundDate: currentdateDash(),
            listReturn: data.list,
            listChange: data2.list

        }
        res.status(200).json(mainData)
    } catch (e) {
        res.status(500).json({status: 500, message: e.message})
    }
})


module.exports = getRefundProduct

