const express = require('express')
require('../../configs/connect')
const {currentdateDash} = require("../../utils/utility");
const {RewardSummary, Promotion} = require("../../models/promotion");
const axios = require("axios");
const {Product} = require("../../models/product");
const {createLog} = require("../../services/errorLog");

const receiptReward = express.Router()

receiptReward.post('/getChangeRewardSummary', async (req, res) => {
    try {
        const data = await RewardSummary.findOne({
            area: req.body.area, storeId: req.body.storeId,
            listPromotion: {
                $elemMatch: {
                    proId: req.body.proId,
                }
            }
        }, {'listPromotion.$': 1, area: 1, storeId: 1})
        let mainData = []
        let groupObj = []
        const responseData = await Promotion.findOne({proId: req.body.proId}, {itemfree: 1, _id: 0})
        for (const listItemFree of responseData.itemfree) {
            // console.log(listItemFree.productId)
            if (listItemFree.productId == '') {
                // console.log('101')
                if (listItemFree.productGroup != '') {
                    const itemFreeData = await Product.find({
                        group: listItemFree.productGroup,
                        size: listItemFree.productSize,
                        "convertFact.unitId": {$ne: '3'}
                    }, {id: 1, _id: 0, name: 1})
                    // console.log(itemFreeData)
                    mainData.push(itemFreeData)
                    groupObj.push({
                        group: listItemFree.productGroup,
                        size: listItemFree.productSize
                    })
                } else {
                    console.log('empty condition')
                }

            } else {
                // console.log('102')
                const itemFreeDataList = await Product.find({
                    id: listItemFree.productId
                }, {id: 1, _id: 0, name: 1})
                // console.log(itemFreeDataList)
                mainData.push(itemFreeDataList)
            }
        }
        const resData = {
            area: req.body.area,
            storeId: req.body.storeId,
            proId: req.body.proId,
            groupObj,
            listProduct: mainData[0]
        }
        await createLog('200',req.method,req.originalUrl,res.body,'getChangeRewardSummary successfully')
        res.status(200).json(resData)
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

receiptReward.post('/updateRewardSummary', async (req, res) => {
    try {
        // await RewardSummary.updateOne(req.body,{$set:req.body})
        // const data = await RewardSummary.updateOne()
        // console.log(req.body)

        const dataReward = await RewardSummary.findOne({
            area: req.body.area, storeId: req.body.storeId, listPromotion: {
                $elemMatch: {proId: req.body.proId}
            }
        },{'listPromotion.$': 1,_id:0})
        console.log(dataReward)
        await createLog('200',req.method,req.originalUrl,res.body,'Update Receipt Promotion Success!')
        res.status(200).json({
            status: 200,
            message: 'Update Receipt Promotion Success!'
        })
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = receiptReward