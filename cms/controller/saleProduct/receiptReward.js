const express = require('express')
require('../../configs/connect')
const { currentdateDash } = require("../../utils/utility");
const { RewardSummary} = require("../../models/promotion");
const axios = require("axios");

const receiptReward = express.Router()

receiptReward.post('/getChangeRewardSummary', async (req,res) =>{
    try{
        const data = await RewardSummary.findOne({area:req.body.area,storeId:req.body.storeId,
            listPromotion: {
            $elemMatch: {
                proId: req.body.proId,
            }}},{'listPromotion.$':1,area:1,storeId:1})

        res.status(200).json(data)
    }catch (error){
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

receiptReward.post('/updateRewardSummary', async (req,res) =>{
    try{
        // await RewardSummary.updateOne(req.body,{$set:req.body})
        // const data = await RewardSummary.updateOne()
        res.status(200).json({
             status:200,
            message:'Update Receipt Promotion Success!'
        })
    }catch (error){
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = receiptReward