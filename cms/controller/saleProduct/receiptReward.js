const express = require('express')
require('../../configs/connect')
const {currentdateDash} = require("../../utils/utility");
const {RewardReceipt} = require("../../models/promotion");

const receiptReward = express.Router()

receiptReward.post('/receiptReward', async (req, res) => {
    try {
        const checkData = await RewardReceipt.findOne({area:req.body.area,storeId:req.body.storeId})
        // console.log((checkData != null))
        if(checkData === null){
        }else  {
            console.log('เจอ Id')
           const action = await RewardReceipt.deleteOne({area:req.body.area,storeId:req.body.storeId})
        }

        const listProduct = req.body.ListProduct
        const listGroup = req.body.ProductGroup
        const totalRewardProduct = []
        const totalRewardGroup = []
        const subTotalRewardGroup = []
        // console.log(listProduct)
        // console.log('*--------------------------------------------------------------------*')
        // console.log(listGroup)

        for (const list2 of listProduct) {
            for (const list of list2.TotalReward) {
                // console.log(list)
                totalRewardProduct.push({
                    productId: list.productId,
                    productName: list.productName,
                    qty: list.qty,
                    unitQty: list.unitQty
                })
            }
        }
        for (const list of listGroup) {
            // console.log(list)
            for (const list2 of list.listProductReward) {
                // console.log(list2)
                subTotalRewardGroup.push({
                    id: list2.id,
                    name: list2.name
                })
            }
            totalRewardGroup.push({
                group: list.group,
                size: list.size,
                proId:list.proId ,
                qtyReward: list.qtyReward,
                qtyUnit: list.qtyUnit,
                listProduct: subTotalRewardGroup
            })
        }

        const saveData = {
            area: req.body.area,
            storeId: req.body.storeId,
            proId: 'pro03',
            listFreeItem: totalRewardProduct,
            listFreeGroup: totalRewardGroup,
            createDate: currentdateDash(),
            updateDate: null
        }
        await RewardReceipt.create(saveData)
        res.status(200).json({status:200,message:'Add/Update RewardReceipt Complete!'})
    } catch
        (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

receiptReward.get('/getReceiptReward', async (req,res) =>{
    try{
       const { area,storeId } = req.query
        console.log(area)
        console.log(storeId)
        const data = await RewardReceipt.findOne(req.quer)
        res.status(200).json(data)
    }catch (error){
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = receiptReward