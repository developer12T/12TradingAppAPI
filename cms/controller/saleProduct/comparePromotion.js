const express = require('express')

require('../../configs/connect')
const axios = require("axios")
const {Promotion, RewardReceipt, RewardSummary} = require("../../models/promotion")
const {Unit, Product} = require("../../models/product")
const _ = require("lodash")
const {calPromotion, currentdateDash} = require("../../utils/utility");
const comparePromotion = express.Router()

comparePromotion.post('/compare', async (req, res) => {
    try {
        const { calPromotion } = require('../../utils/utility')
        const PromotionProductMatch = []
        const PromotionGroupMatch = []

        const dataSummary = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/getSummaryCart', {
            area: req.body.area,
            storeId: req.body.storeId
        })

        // 1.เช็ค ว่า productId ใน summarryCart มี ใน Promotion ไหม ต้องเช็คอีกที่ว่า สินค้าอันไหนบ้างที่เข้าโปร
        for (const listGroup of dataSummary.data.list.listProduct) {
            const dataPromotion = await Promotion.find({itembuy: {$elemMatch: {productId: listGroup.id}}})
            if (!dataPromotion || dataPromotion.length === 0) {
                // console.log('ไม่มีสินค้าไหนอยุ่ในเงื่อนไขของ promotion')
            } else {
                for (const listDataPromotion of dataPromotion) {
                    for (const itemList of listDataPromotion.itembuy) {

                        /*
                            x(ซื้อ) / y(เงื่อนไขโปร) >= 1 ซื้อเกินโปรโมชั่นแล้ว
                            x(ซื้อ) / y(เงื่อนไขโปร) <= 1 ซื้อยังไม่ถึงโปรโมชั่น
                        */

                        if (itemList.productUnit === listGroup.qtyUnitId) {
                            // console.log(listGroup)
                            // ตรงนี้ต้อง convert unit ถ้า unit ไม่ตรง เพื่อให้เช็คว่าซื้อครบตาม unit ไหม
                            if (listGroup.qtyPurc >= itemList.productQty) {
                                // console.log('Reward Promotion')
                                const dataUnitName = await Unit.findOne({idUnit: listGroup.qtyUnitId})

                                const rewardData = await Promotion.findOne({proId: listDataPromotion.proId})
                                var ttReward = []
                                for (const listRewardData of rewardData.itemfree) {
                                    const dataUnitName1 = await Unit.findOne({idUnit: listRewardData.productUnit})
                                    const productDetail = await Product.findOne({id: listRewardData.productId})
                                    ttReward.push({
                                        productId: listRewardData.productId,
                                        productName: productDetail.name,
                                        qty: await calPromotion(listGroup.qtyPurc, itemList.productQty, listRewardData.productQty),
                                        unitQty: dataUnitName1.nameEng
                                    })
                                }
                                const data_obj = {
                                    // type:'Product List',
                                    productId: listGroup.id,
                                    proId: listDataPromotion.proId,
                                    TotalPurchasedQuantity: {
                                        productId: listGroup.id,
                                        qty: listGroup.qtyPurc,
                                        nameQty: dataUnitName.nameEng
                                    },
                                    TotalReward: ttReward
                                }
                                PromotionProductMatch.push(data_obj)
                            }
                        } else {
                            // ต้อง convert หน่วยก่อนค่อยเอามาเปรียบเทียบ
                            // 1. แปลงเป็นหน่วยย่อยที่สุด
                            // 2. เอาไปหารตัว convert.product
                            // 3. แล้วค่อยเช็คว่าได้เท่าโปรโมชั่นไหม

                            const convertChange = await Product.findOne({
                                id: listGroup.id,
                                convertFact: {$elemMatch: {unitId: listGroup.qtyUnitId}}
                            }, {'convertFact.$': 1})

                            // console.log(listGroup.qtyPurc*convertChange.convertFact[0].factor)
                            const convertChangePro = await Product.findOne({
                                id: listGroup.id,
                                convertFact: {$elemMatch: {unitId: itemList.productUnit}}
                            }, {'convertFact.$': 1})

                            console.log((listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor)

                            // สร้างเงื่อนไขเปรียบเทียบ จำนวนการซื้อ
                            if ((listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor >= itemList.productQty) {
                                console.log('ได้โปรโมชั่น')
                            }
                        }
                    }
                }
            }
        }

        //2.เช็ค ว่า ใน group ของ summaryCart มี ใน Promotion ไหม
        for (const listGroup of dataSummary.data.list.listProductGroup) {
            const dataPromotionGroup = await Promotion.find({
                itembuy: {
                    $elemMatch: {
                        productGroup: listGroup.group,
                        productSize: listGroup.size
                    }
                }
            })
            if (dataPromotionGroup.length > 0) {
                for (const listGroupPromotion of dataPromotionGroup) {
                    for (const itemBuyList of listGroupPromotion.itembuy) {
                        const unitDetail = await Unit.findOne({idUnit: itemBuyList.productUnit})

                        const filterData = _.filter(listGroup.converterUnit, {'name': unitDetail.nameEng})
                        // console.log(filterData)

                        if (filterData[0].qty >= itemBuyList.productQty) {
                            var ttRewardGroup = []
                            const rewardDataGroup = await Promotion.findOne({proId: listGroupPromotion.proId})
                            for (const listRewardData of rewardDataGroup.itemfree) {
                                const dataUnitName1 = await Unit.findOne({idUnit: listRewardData.productUnit})
                                // const dataUnitName1 = await Unit.findOne({idUnit: listRewardData.productUnit})

                                const dataRewardItem = await Product.find({
                                    group: listRewardData.productGroup,
                                    size: listRewardData.productSize,
                                    "convertFact.unitId": {$ne: '3'}
                                }, {id: 1, _id: 0, name: 1})

                                ttRewardGroup.push({
                                    productId: listRewardData.productGroup,
                                    qty: await calPromotion(listGroup.qtyPurc, itemBuyList.productQty, listRewardData.productQty),
                                    unitQty: dataUnitName1.nameEng
                                })

                                const data_obj = {
                                    group: listGroup.group,
                                    size: listGroup.size,
                                    proId: listGroupPromotion.proId,
                                    qtyReward: await calPromotion(filterData[0].qty, itemBuyList.productQty, listRewardData.productQty),
                                    qtyUnit: dataUnitName1.nameEng,
                                    listProductReward: dataRewardItem,
                                    listProduct:listGroup.listProduct
                                }
                                PromotionGroupMatch.push(data_obj)
                            }
                        }
                    }
                }
            } else {
            }
        }

        // ยิง rest api ไป อัพเดต หรือเก็บข้อมูลลง RewardReceipt
        const addRewardReceipt = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/receiptReward', {
            area: req.body.area,
            storeId: req.body.storeId,
            ListProduct: PromotionProductMatch,
            ProductGroup: PromotionGroupMatch
        })

        if (addRewardReceipt.status == 200) {
            // console.log('ยิงไปอัปเดตสำเร็จ')
            // console.log(addRewardReceipt.data)
        } else {
            // console.log('ยิงไปอัปเดตไม่สำเร็จ')
            // console.log(addRewardReceipt.data)
        }

        res.status(200).json({ListProduct: PromotionProductMatch, ProductGroup: PromotionGroupMatch})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

comparePromotion.post('/summaryCompare', async (req, res) => {
    try {
        const response = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/compare',req.body)
        const data = response.data
        const freeItem = []
        // console.log(data.ListProduct)
        for(const list of data.ListProduct){
            // console.log(list.TotalReward)
            for (const subList of list.TotalReward){
                // console.log(subList)
                if(subList.productId == list.productId){
                    subList.proId = list.proId
                    freeItem.push(subList)
                }
            }
            // console.log(list.productId)
        }
        for(const list of data.ProductGroup){
            let idProduct = ''
            let nameProduct = ''
            // console.log(_.uniqBy(list.listProduct, 'id'))
            const uniqListProduct = _.uniqBy(list.listProduct, 'id')
            for(const subList of list.listProductReward){
                // console.log(subList)
                for(const memberList of uniqListProduct){
                    // console.log(memberList)
                    if (memberList.id == subList.id){
                         // console.log('มี id อยุ่แล้ว')
                         idProduct = subList.id
                        nameProduct = subList.name
                    }
                }
            }
            // console.log(idProduct)
            freeItem.push({
                productId:idProduct,
                productName:nameProduct,
                qty:list.qtyReward,
                unitQty: list.qtyUnit,
                proId:list.proId,
            })
        }

        //2. เอาข้อมูลจากตรงนี้(ข้างบน) เก็บลงไปใน doc.RewardSummary
        const dataArray = []
        let  dataFreeItem = freeItem

        for(const list of freeItem ){
            // console.log(list.proId)
            if(dataArray.length > 0){
                // console.log('ไม่ว่าง')

                for (const subList of dataArray){
                    console.log(`${list.proId} == ${subList.proId}`)
                    if(list.proId == subList.proId ){
                        console.log('มีอยู่แล้ว')

                    }else{
                        console.log('ไม่มี promotion ')
                        const mainData = {
                            area:req.body.area,
                            storeId: req.body.storeId,
                            proId:list.proId,
                            summaryQty:list.qty,
                            list:[list]
                        }
                        dataArray.push(mainData)
                    }
                }

            }else{
                // console.log('ว่าง')
                const mainData = {
                    area:req.body.area,
                    storeId: req.body.storeId,
                    proId:list.proId,
                    summaryQty:list.qty,
                    list:[list]
                }
                dataArray.push(mainData)
            }
        }
        // console.log(_.intersectionBy(dataArray, freeItem,'proId'))
         console.log(dataArray)
        // await RewardSummary.create(dataArray)
        const preDataToInsert = {
            area:req.body.area,
            storeId:req.body.storeId,

        }

        //3. ดึงข้อมูลจาก doc.RewardSummary มาแสดงแทน

        res.status(200).json({ status:200,message:'Get/Calculator Data Complete',data:freeItem })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = comparePromotion