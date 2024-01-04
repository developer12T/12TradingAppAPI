const express = require('express')

require('../../configs/connect')
const _ = require('lodash')
const axios = require("axios")
const {Promotion} = require("../../models/promotion")
const {Unit} = require("../../models/product")
const comparePromotion = express.Router()

comparePromotion.post('/compare', async (req, res) => {
    try {
        const PromotionProductMatch = []
        const PromotionGroupMatch = []
        const dataSummary = await axios.post(process.env.API_URL_IN_USE+'/cms/saleProduct/getSummaryCart',{area:req.body.area,storeId:req.body.storeId})

        //1.เช็ค ว่า productId ใน summarryCart มี ใน Promotion ไหม ต้องเช็คอีกที่ว่า สินค้าอันไหนบ้างที่เข้าโปร
            for(const listGroup of dataSummary.data.list.listProduct){
                const dataPromotion = await Promotion.find({itembuy:{$elemMatch:{productId:listGroup.id}}})
                if(!dataPromotion || dataPromotion.length === 0){
                     // console.log('ไม่มีสินค้าไหนอยุ่ในเงื่อนไขของ promotion')
                }else{
                    for(const listDataPromotion of dataPromotion){
                        // console.log(listDataPromotion.proId)
                        for (const itemList of listDataPromotion.itembuy){
                            // console.log(listGroup)
                            // console.log(itemList)
                            /*
                                x(ซื้อ) / y(เงื่อนไขโปร) >= 1 ซื้อเกินโปรโมชั่นแล้ว
                                x(ซื้อ) / y(เงื่อนไขโปร) <= 1 ซื้อยังไม่ถึงโปรโมชั่น
                            */

                            if (itemList.productUnit === listGroup.qtyUnitId){
                                // console.log(listGroup)
                                if( listGroup.qtyPurc >= itemList.productQty ){
                                    console.log('เกินโปรโมชั่นแล้ว')
                                    const dataUnitName = await Unit.findOne({idUnit:listGroup.qtyUnitId})

                                    const rewardData = await Promotion.findOne({proId:listDataPromotion.proId})
                                    var ttReward = []
                                    for(const listRewardData of rewardData.itemfree){
                                        const dataUnitName1 = await Unit.findOne({idUnit:listRewardData.productUnit})
                                        ttReward.push({
                                            productId:listRewardData.productId,
                                            qty:(listGroup.qtyPurc/(itemList.productQty/listRewardData.productQty)),
                                            unitQty:dataUnitName1.nameEng
                                        })
                                    }
                                    const data_obj = {
                                        // type:'Product List',
                                        productId:listGroup.id,
                                        proId:listDataPromotion.proId,
                                        TotalPurchasedQuantity:{
                                            productId:listGroup.id,
                                            qty:listGroup.qtyPurc,
                                            nameQty:dataUnitName.nameEng
                                        },
                                        TotalReward:ttReward
                                    }
                                    PromotionProductMatch.push(data_obj)
                                }
                            }else {}

                            // module compare
                            // console.log(listGroup)
                            // if(listGroup.qtyPurc >= itemList.productQty){
                            //     const data_obj = {
                            //         // type:'Product List',
                            //         productId:listGroup.id,
                            //         proId:listDataPromotion.proId,
                            //         TotalPurchasedQuantity:{
                            //             productId:'10011101011',
                            //             qty:2,
                            //             nameQty:'BAG'
                            //         },
                            //         TotalReward:{
                            //             productId:'10011101011',
                            //             qty:1,
                            //             unitQty:'PCS'
                            //         }
                            //     }
                            //         PromotionProductMatch.push(data_obj)
                            //         // console.log(listGroup.id+' อยู่ใน โปรโมชั่น')
                            // }else {
                            //      console.log('ไม่มีสินค้าไหนอยุ่ในเงื่อนไขของ promotion')
                            // }
                            // module compare
                        }
                    }
                }
            }

        //2.เช็ค ว่า ใน group ของ summaryCart มี ใน Promotion ไหม
        //     for(const listGroup of dataSummary.data.list.listProductGroup){
        //         const dataPromotionGroup = await Promotion.find({itembuy:{$elemMatch:{productGroup:listGroup.group,productSize:listGroup.size}}})
        //         if(dataPromotionGroup.length > 0){
        //             for(const listGroupPromotion of dataPromotionGroup){
        //                 for (const itemBuyList of listGroupPromotion.itembuy){
        //                     const unitDetail = await Unit.findOne({idUnit:itemBuyList.productUnit})
        //                     // console.log(unitDetail.nameEng)
        //
        //                     // module compare unit
        //                         if(listGroup.qty >= itemBuyList.productQty){
        //                         const data_obj = {
        //                             group:listGroup.group,
        //                             size:listGroup.size,
        //                             proId:listGroupPromotion.proId,
        //                             TotalPurchasedQuantity:{
        //                                 productId:'10011101011',
        //                                 qty:2,
        //                                 nameQty:'BAG'
        //                             },
        //                             TotalReward:{
        //                                 productId:listGroup.id,
        //                                 qty:1,
        //                                 unitQty:'PCS'
        //                             }
        //                         }
        //                         PromotionGroupMatch.push(data_obj)
        //                     }else{}
        //                     // module compare unit
        //                 }
        //             }
        //         }else{}
        //     }

            // 3. converting unit prepare compare
        /*
        */

        // res.status(200).json(req.originalUrl)
        res.status(200).json({ListProduct:PromotionProductMatch,ProductGroup:PromotionGroupMatch})

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = comparePromotion