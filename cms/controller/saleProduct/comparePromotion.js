const express = require('express')

require('../../configs/connect')
const _ = require('lodash')
const axios = require("axios");
const {Promotion} = require("../../models/promotion");
const {Unit} = require("../../models/product");
const comparePromotion = express.Router()

comparePromotion.post('/compare', async (req, res) => {
    try {
        const PromotionProductMatch = []
        const PromotionGroupMatch = []
        const dataSummary = await axios.post(process.env.API_URL_IN_USE+'/cms/saleProduct/getSummaryCart',{area:req.body.area,storeId:req.body.storeId})
        //1.เช็ค ว่า productId ใน summarryCart มี ใน Promotion ไหม

            for(const listGroup of dataSummary.data.list.listProduct){
                const dataPromotion = await Promotion.find({itembuy:{$elemMatch:{productId:listGroup.id}}})
                if(!dataPromotion || dataPromotion.length === 0){
                    // console.log('ไม่มีสินค้าไหนอยุ่ในเงื่อนไขของ promotion')
                }else{
                    for(const listDataPromotion of dataPromotion){
                        // console.log(listDataPromotion)
                        for (const itemList of listDataPromotion.itembuy){
                             // console.log(itemList.productId) console.log(itemList.productQty)
                            if(listGroup.qtyPurc >= itemList.productQty){
                                const data_obj = {
                                    // type:'Product List',
                                    productId:listGroup.id,
                                    proId:listDataPromotion.proId,
                                    TotalPurchasedQuantity:{
                                        qty:2,
                                        nameQty:'BAG'
                                    },
                                    TotalReward:{
                                        productId:'100101010202'
                                    }
                                }
                                    PromotionProductMatch.push(data_obj)
                                    // console.log(listGroup.id+' อยู่ใน โปรโมชั่น')
                            }else {
                                 // console.log('ไม่มีสินค้าไหนอยุ่ในเงื่อนไขของ promotion')
                            }
                        }
                    }
                }
            }

        //2.เช็ค ว่า ใน group ของ summaryCart มี ใน Promotion ไหม
            for(const listGroup of dataSummary.data.list.listProductGroup){
                const dataPromotionGroup = await Promotion.find({itembuy:{$elemMatch:{productGroup:listGroup.group,productSize:listGroup.size}}})
                if(dataPromotionGroup.length > 0){
                    for(const listGroupPromotion of dataPromotionGroup){
                        for (const itemBuyList of listGroupPromotion.itembuy){
                            const unitDetail = await Unit.findOne({idUnit:itemBuyList.productUnit})
                            // const unitDetailSummary = await Unit.findOne({idUnit:listGroup})
                            console.log(unitDetail.nameEng)
                            // console.log(unitDetailSummary.nameEng)
                            if(listGroup.qty >= itemBuyList.productQty){
                                const data_obj = {
                                    group:listGroup.group,
                                    size:listGroup.size,
                                    proId:listGroupPromotion.proId,
                                    TotalPurchasedQuantity:{
                                        qty:2,
                                        nameQty:'BAG'
                                    },
                                    TotalReward:{
                                        productId:'100101010202'
                                    }
                                }
                                PromotionGroupMatch.push(data_obj)
                            }else{}
                        }
                    }
                }else{}
                // console.log(dataPromotionGroup)
            }
        res.status(200).json({ProductList:PromotionProductMatch,ProductGroup:PromotionGroupMatch})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = comparePromotion