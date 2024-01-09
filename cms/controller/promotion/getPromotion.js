const express = require('express')
require('../../configs/connect')
const {Promotion} = require("../../models/promotion")
const {Product} = require("../../models/product")
const getPromotion = express.Router()
getPromotion.post('/getPromotion', async (req, res) => {
    try {
        const data = await Promotion.find()
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getPromotion.post('/getChangeReward', async (req, res) => {
    try {
        const  { calPromotion } = require('../../utils/utility')
        const data = await Promotion.findOne({proId: req.body.proId}, {itemfree: 1, proId: 1, _id: 0})
        var dataItem = []
        for (const list of data.itemfree) {
            if (!list.productId) {
                console.log('เป็นแถมแบบ group')
                const dataRewardItem = await Product.find({
                    group: list.productGroup,
                    size: list.productSize,
                    // "convertFact.unitId": {$ne: '3'}
                }, {id: 1, _id: 0, name: 1})

                for (const sublist of dataRewardItem) {
                    dataItem.push(sublist)
                }

            } else {
                console.log(`เป็นแถมระบุ item :: ${list.productId}`)
                const dataRewardItem = await Product.findOne({id: list.productId}, {_id: 0, id: 1, name: 1})
                // const qtyReceipt = await Promotion.findOne({proId:req.body.proId})
                console.log(list)
                var a = 3
                var b = 2
                const subData = {
                    id: dataRewardItem.id,
                    name: dataRewardItem.name,
                    qty: calPromotion(req.body.qty,a,b)
                    // จำนวนที่ซื้อ(3(จำนวนซื้อ)/2(จำนวนแถม))
                }
                dataItem.push(subData)
            }
        }

        const mainData = {
            promotionData: data.itemfree,
            itemFree: dataItem
        }
        res.status(200).json(mainData)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getPromotion