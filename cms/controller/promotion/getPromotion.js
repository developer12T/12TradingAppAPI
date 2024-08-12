const express = require('express')
require('../../configs/connect')
const {Promotion, RewardReceipt} = require("../../models/promotion")
const {Product} = require("../../models/product")
const {calPromotion} = require("../../utils/utility")
const getPromotion = express.Router()
const {takeNameEng, takeNameThai} = require('../../services/takeNameUnit')
const {convertUnit} = require('../../services/convertUnit')
const {createLog} = require("../../services/errorLog");
getPromotion.post('/getPromotion', async (req, res) => {
    try {
        const data = await Promotion.find()
        await createLog('200',req.method,req.originalUrl,res.body,'getPromotion Successfully!')
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getPromotion.post('/getChangeReward', async (req, res) => {
    try {
        const {calPromotion} = require('../../utils/utility')
        const data = await Promotion.findOne({proId: req.body.proId}, {rewards: 1, proId: 1, _id: 0})
        var dataItem = []
        for (const list of data.rewards) {
            if (!list.productId) {
                console.log('เป็นแถมแบบ group')
                const dataRewardItem = await Product.find({
                    group: list.productGroup,
                    size: list.productSize,
                    // "convertFact.unitId": {$ne: '3'}
                }, {_id: 0, id: 1, name: 1})

                dataItem.push(...dataRewardItem)

            } else {
                console.log(`เป็นแถมระบุ item :: ${list.productId}`)

                const dataRewardItem = await Product.findOne({id: list.productId}, {_id: 0, id: 1, name: 1})
                const dataPromotion = await Promotion.findOne({proId: req.body.proId}, {
                    _id: 0,
                    conditions: 1,
                    rewards: 1
                })

                for (let list of dataPromotion.conditions) {
                    const unitName = await takeNameEng(list.productUnit)
                    console.log('conditions :: ' + list.productQty + ' ' + unitName + `(${list.productUnit})`)
                    if (list.productUnit == req.body.unitQty) {
                        console.log('หน่วยตรง')

                    } else {
                        console.log('หน่วยไม่ตรง')
                        const data = await convertUnit(dataRewardItem.id, list.productUnit)

                        console.log(data)
                    }
                    console.log('*------------------------*')

                }

                // แทนค่าจากฐานข้อมูล
                let a = 3
                let b = 1

                const subData = {
                    id: dataRewardItem.id,
                    name: dataRewardItem.name,
                    qty: await calPromotion(req.body.qty, a, b)
                }
                dataItem.push(subData)
                // แทนค่าจากฐานข้อมูล
            }
        }

        const mainData = {
            // promotionData: data.itemfree,
            rewards: dataItem
        }
        await createLog('200',req.method,req.originalUrl,res.body,'getChangeReward Successfully!')
        res.status(200).json(mainData)
    } catch (e) {
        console.log(e)
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getPromotion.post('/getChangeRewardTest', async (req, res) => {
    try {

        const data = await RewardReceipt.findOne({area: req.body.area, storeId: req.body.storeId})

        // console.log(data.area + ' : ' + data.storeId)
        // console.log(data.listFreeItem)

        for(const list of data.listFreeItem){
            console.log(list)
            console.log('*------------------------------------*')
        }

        for(const list of data.listFreeGroup){
            console.log(list)
            console.log('//******************************************//')
        }

        // const {proId, qty, unitQty} = req.body
        // const dataPromotion = await Promotion.findOne({proId}, {_id: 0, itemfree: 1})
        // const { convertUnit } = require('../../services/convertUnit')
        // const groupArr = []
        // const sizeArr = []
        // const itemArr = []
        // const qtyRewardArr = []
        //
        // for (const list of dataPromotion.itemfree) {
        //     const productData = await Product.findOne({id:list.productId})
        //     console.log(list.productId)
        //     console.log(list.productQty)
        //     console.log(list.productUnit)
        //     console.log(list.productGroup)
        //     console.log(await convertUnit(list.productId,list.productUnit))
        //
        //     if(!list.productGroup){
        //         console.log('ไม่มีgroup')
        //     }else{
        //         groupArr.push(list.productGroup)
        //     }
        //
        //     if(!list.productSize){
        //         console.log('ไม่มีกลุ่มของขนาด')
        //     }else{
        //         sizeArr.push(list.productSize)
        //     }
        //
        //     if(!list.productId){
        //         console.log('ไม่มีสินค้ารายไอเท็ม')
        //     }else{
        //         const mainData = {
        //             id:list.productId,
        //             name:productData.name,
        //             qty:10,
        //             unit:'2'
        //         }
        //         itemArr.push(mainData)
        //     }
        //
        //     const RewardQty = {
        //         qty: 2,
        //         unit: 'PCS'
        //     }
        //     qtyRewardArr.push(RewardQty)
        //     console.log('*-----------------------------------------------------------------*')
        // }

        res.status(200).json(data)

        // res.status(200).json({
        //     group: groupArr,
        //     size: sizeArr,
        //     itemFree: itemArr,
        //     qtyReward:qtyRewardArr
        // })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getPromotion