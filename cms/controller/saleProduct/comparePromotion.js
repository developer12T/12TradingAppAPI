const express = require('express')

require('../../configs/connect')
const _ = require('lodash')
const axios = require("axios");
const {Promotion} = require("../../models/promotion");
const comparePromotion = express.Router()

comparePromotion.post('/compare', async (req, res) => {
    try {
        const dataSummary = await axios.post(process.env.API_URL_IN_USE+'/cms/saleProduct/getSummaryCart',{area:req.body.area,storeId:req.body.storeId})
        const PromotionProductMatch = []
        const PromotionGroupMatch = []
        //1.เช็ค ว่า productId ใน summarryCart มี ใน Promotion ไหม

            for(const listGroup of dataSummary.data.list.listProduct){
                const dataPromotion = await Promotion.find({itembuy:{$elemMatch:{productId:listGroup.id}}})
                if(!dataPromotion || dataPromotion.length === 0){
                    console.log('ไม่มีสินค้าไหนอยุ่ในเงื่อนไขของ promotion')
                }else{

                    for(const listDataPromotion of dataPromotion){
                        console.log(listDataPromotion)
                        if(listDataPromotion.){

                        }else{

                        }
                        if(listGroup.qtyPurc >= listDataPromotion.itembuy[0].productQty){
                            console.log(listGroup.id+' อยู่ใน โปรโมชั่น')
                        }else {
                            console.log('ไม่มีสินค้าไหนอยุ่ในเงื่อนไขของ promotion')
                        }

                    }
                }
            }
        //2.เช็ค ว่า ใน group ของ summarryCart มี ใน Promotion ไหม

        res.status(200).json(dataSummary.data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = comparePromotion