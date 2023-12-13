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
        if(!data){

            const dataStore = await Store.findOne({
                storeId:req.body.storeId
            })
            const totalReturn = 0
            const totalChange = _.sumBy(data2.list, 'sumPrice')

            const mainData = {
                storeId: req.body.storeId,
                storeName: dataStore.name,
                totalReturn: totalReturn.toFixed(2),
                totalChange: totalChange.toFixed(2),
                diffAmount: (totalReturn-totalChange).toFixed(2),
                refundDate: currentdateDash(),
                listReturn: [],
                listChange: data2.list
            }
            res.status(200).json(mainData)
        }else if(!data2){

            const dataStore = await Store.findOne({
                storeId:req.body.storeId
            })

            const totalReturn = _.sumBy(data.list, 'sumPrice')
            const totalChange = 0

            const mainData = {
                storeId: req.body.storeId,
                storeName: dataStore.name,
                totalReturn: totalReturn.toFixed(2),
                totalChange: totalChange.toFixed(2),
                diffAmount: (totalReturn-totalChange).toFixed(2),
                refundDate: currentdateDash(),
                listReturn: data.list,
                listChange: []

            }
            res.status(200).json(mainData)
        }else{
            const dataStore = await Store.findOne({
                storeId:req.body.storeId
            })

            const totalReturn = _.sumBy(data.list, 'sumPrice')
            const totalChange = _.sumBy(data2.list, 'sumPrice')
            const listData_arr = []
            const listData_arr2 = []

            for(const list of data.list){
                const listDataOBJ = {
                    "id":list.id,
                    "name": list.name,
                    "unitId": list.unitId,
                    "priceUnit": list.priceUnit.toFixed(2),
                    "qty":list.qty,
                    "sumPrice": list.sumPrice.toFixed(2),
                    "productCondition": list.productCondition,
                }
                listData_arr.push(listDataOBJ)
            }

            for(const list of data2.list){
                const listData2 = {
                    "id":list.id,
                    "name": list.name,
                    "unitId": list.unitId,
                    "priceUnit": list.priceUnit.toFixed(2),
                    "qty":list.qty,
                    "sumPrice": list.sumPrice.toFixed(2),
                    "productCondition": list.productCondition,
                }
                listData_arr2.push(listData2)
            }

            const mainData = {
                storeId: req.body.storeId,
                storeName: dataStore.name,
                totalReturn: totalReturn.toFixed(2),
                totalChange: totalChange.toFixed(2),
                diffAmount: (totalReturn-totalChange).toFixed(2),
                refundDate: currentdateDash(),
                listReturn: listData_arr,
                listChange: listData_arr2
            }
            res.status(200).json(mainData)
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({status: 500, message: e.message})
    }
})


module.exports = getRefundProduct

