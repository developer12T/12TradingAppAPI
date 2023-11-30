const express = require('express')
require('../../configs/connect')

const {Refund, CartRefund} = require('../../models/refund')
const {NumberSeries} = require("../../models/numberSeries");
const {available, updateAvailable} = require("../../services/numberSeriers");
const {currentdateDash} = require("../../utils/utility");
const {Product} = require("../../models/product");
const {Store} = require("../../models/store");
const getRefundProduct = express.Router()
const _ = require('lodash')
getRefundProduct.post('/getPreRefund', async (req, res) => {
    try {
        const data = await CartRefund.findOne({area: req.body.area, storeId: req.body.storeId, type: 'refund'})
        const data2 = await CartRefund.findOne({area: req.body.area, storeId: req.body.storeId, type: 'change'})
        const dataStore = await Store.findOne({
            idCharecter: req.body.storeId.substring(0, 3),
            idNumber: req.body.storeId.substring(3)
        })

        const totalReturn = _.sumBy(data.list, 'sumPrice')
        const totalChange = _.sumBy(data2.list, 'sumPrice')

        const mainData = {
            storeId: req.body.storeId,
            storeName: dataStore.name,
            "totalReturn": totalReturn,
            "totalChange": totalChange,
            "diffAmount": 200,
            "listReturn": [
                {
                    "id": "11700014",
                    "unit": "1",
                    "qty": 10
                },
                {
                    "id": "11700015",
                    "unit": "2",
                    "qty": 10
                }
            ],
            "listChange": [
                {
                    "id": "11700014",
                    "unit": "1",
                    "qty": 10
                },
                {
                    "id": "11700015",
                    "unit": "2",
                    "qty": 10
                }
            ],
            "refundDate": "2023-10-15T22:10",
            "numberSeries": {
                "type": "order",
                "zone": "MBE"
            }
        }
        res.status(200).json(mainData)
    } catch (e) {
        res.status(500).json({status: 500, message: e.message})
    }
})


module.exports = getRefundProduct

