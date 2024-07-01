const express = require('express')
require('../../configs/connect')
const { Promotion, RewardSummary } = require("../../models/promotion")
const { Unit, Product } = require("../../models/product")
const _ = require("lodash")
const { calPromotion, slicePackSize } = require("../../utils/utility")
const { createLog } = require("../../services/errorLog")
const axios = require("axios")
const { log } = require('winston')
const comparePromotion = express.Router()

comparePromotion.post('/compare', async (req, res) => {
    try {
        const PromotionProductMatch = []
        const PromotionGroupMatch = []
        const PromotionDiscountMatch = []

        const dataSummary = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/getSummaryCart', {
            area: req.body.area,
            storeId: req.body.storeId
        })

        console.log('dataSummary:', JSON.stringify(dataSummary.data, null, 2))

        const totalAmount = dataSummary.data.list.totalAmount
        console.log('totalAmount:', totalAmount)

        // ตรวจสอบรายการสินค้าทีละรายการ
        for (const listGroup of dataSummary.data.list.listProduct) {
            console.log('listGroup:', listGroup)
            const dataPromotion = await Promotion.find({ 
                $or: [
                    { 'conditions': { $elemMatch: { productId: listGroup.id } } },
                    { 'conditions': { $elemMatch: { productGroup: listGroup.group, productSize: listGroup.size } } }
                ] 
            })
            console.log('dataPromotion:', dataPromotion)
            if (dataPromotion && dataPromotion.length > 0) {
                for (const listDataPromotion of dataPromotion) {
                    for (const itemList of listDataPromotion.conditions) {
                        console.log('itemList:', itemList)
                        if (itemList.productQty === 0 && itemList.productAmount > 0) {
                            if (totalAmount >= itemList.productAmount) {
                                if (listDataPromotion.proType === 'discount') {
                                    const discountPerUnit = listDataPromotion.discounts[0].amount
                                    const discountTotal = Math.floor(totalAmount / itemList.productAmount) * discountPerUnit
                                    const data_obj = {
                                        productId: listGroup.id,
                                        proId: listDataPromotion.proId,
                                        discount: discountTotal,
                                        TotalPurchasedQuantity: {
                                            productId: listGroup.id,
                                            qty: listGroup.qtyPurc,
                                            nameQty: listGroup.qtyUnitName
                                        }
                                    }
                                    PromotionDiscountMatch.push(data_obj)
                                } else if (listDataPromotion.proType === 'free') {
                                    const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId })
                                    const ttReward = []
                                    for (const listRewardData of rewardData.rewards) {
                                        const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
                                        const productDetail = await Product.findOne({ id: listRewardData.productId })
                                        ttReward.push({
                                            productId: listRewardData.productId,
                                            productName: productDetail.name,
                                            qty: listRewardData.productQty,
                                            unitQty: dataUnitName1.nameEng
                                        })
                                    }
                                    const data_obj = {
                                        productId: listGroup.id,
                                        proId: listDataPromotion.proId,
                                        TotalPurchasedQuantity: {
                                            productId: listGroup.id,
                                            qty: listGroup.qtyPurc,
                                            nameQty: listGroup.qtyUnitName
                                        },
                                        TotalReward: ttReward
                                    }
                                    PromotionProductMatch.push(data_obj)
                                }
                            }
                        } else {
                            if (itemList.productUnit === listGroup.qtyUnitId) {
                                if (listGroup.qtyPurc >= itemList.productQty) {
                                    if (listDataPromotion.proType === 'discount') {
                                        const discountPerUnit = listDataPromotion.discounts[0].amount
                                        const discountTotal = Math.floor(listGroup.qtyPurc / itemList.productQty) * discountPerUnit
                                        const data_obj = {
                                            productId: listGroup.id,
                                            proId: listDataPromotion.proId,
                                            discount: discountTotal,
                                            TotalPurchasedQuantity: {
                                                productId: listGroup.id,
                                                qty: listGroup.qtyPurc,
                                                nameQty: listGroup.qtyUnitName
                                            }
                                        }
                                        PromotionDiscountMatch.push(data_obj)
                                    } else if (listDataPromotion.proType === 'free') {
                                        const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId })
                                        const ttReward = []
                                        for (const listRewardData of rewardData.rewards) {
                                            const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
                                            const productDetail = await Product.findOne({ id: listRewardData.productId })
                                            ttReward.push({
                                                productId: listRewardData.productId,
                                                productName: productDetail.name,
                                                qty: await calPromotion(listGroup.qtyPurc, itemList.productQty, listRewardData.productQty),
                                                unitQty: dataUnitName1.nameEng
                                            })
                                        }
                                        const data_obj = {
                                            productId: listGroup.id,
                                            proId: listDataPromotion.proId,
                                            TotalPurchasedQuantity: {
                                                productId: listGroup.id,
                                                qty: listGroup.qtyPurc,
                                                nameQty: listGroup.qtyUnitName
                                            },
                                            TotalReward: ttReward
                                        }
                                        PromotionProductMatch.push(data_obj)
                                    }
                                }
                            } else {
                                const convertChange = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: listGroup.qtyUnitId } } }, { 'convertFact.$': 1 })
                                const convertChangePro = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: itemList.productUnit } } }, { 'convertFact.$': 1 })

                                if ((listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor >= itemList.productQty) {
                                    if (listDataPromotion.proType === 'discount') {
                                        const discountPerUnit = listDataPromotion.discounts[0].amount
                                        const discountTotal = Math.floor((listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor / itemList.productQty) * discountPerUnit
                                        const data_obj = {
                                            productId: listGroup.id,
                                            proId: listDataPromotion.proId,
                                            discount: discountTotal,
                                            TotalPurchasedQuantity: {
                                                productId: listGroup.id,
                                                qty: listGroup.qtyPurc,
                                                nameQty: listGroup.qtyUnitName
                                            }
                                        }
                                        PromotionDiscountMatch.push(data_obj)
                                    } else if (listDataPromotion.proType === 'free') {
                                        console.log('ได้โปรโมชั่นของแถม')
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // ตรวจสอบกลุ่มสินค้าทีละกลุ่ม
        for (const listGroup of dataSummary.data.list.listProductGroup) {
            const dataPromotionGroup = await Promotion.find({ 'conditions': { $elemMatch: { productGroup: listGroup.group, productSize: listGroup.size } } })
            console.log('dataPromotionGroup:', dataPromotionGroup)
            if (dataPromotionGroup.length > 0) {
                for (const listGroupPromotion of dataPromotionGroup) {
                    for (const itemBuyList of listGroupPromotion.conditions) {
                        const unitDetail = await Unit.findOne({ idUnit: itemBuyList.productUnit })
                        const filterData = _.filter(listGroup.converterUnit, { 'name': unitDetail.nameEng })

                        if (filterData[0].qty >= itemBuyList.productQty) {
                            if (listGroupPromotion.proType === 'discount') {
                                const discountPerUnit = listGroupPromotion.discounts[0].amount
                                const discountTotal = Math.floor(filterData[0].qty / itemBuyList.productQty) * discountPerUnit
                                PromotionDiscountMatch.push({
                                    group: listGroup.group,
                                    size: listGroup.size,
                                    proId: listGroupPromotion.proId,
                                    discount: discountTotal
                                })
                            } else if (listGroupPromotion.proType === 'free') {
                                const ttRewardGroup = []
                                const rewardDataGroup = await Promotion.findOne({ proId: listGroupPromotion.proId })
                                for (const listRewardData of rewardDataGroup.rewards) {
                                    const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
                                    const dataRewardItem = await Product.find({ group: listRewardData.productGroup, size: listRewardData.productSize, "convertFact.unitId": { $ne: '3' } }, { id: 1, _id: 0, name: 1 })
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
                                        listProduct: listGroup.listProduct
                                    }
                                    PromotionGroupMatch.push(data_obj)
                                }
                            }
                        }
                    }
                }
            }
        }

        await createLog('200', req.method, req.originalUrl, res.body, ' getCompare successfully')
        res.status(200).json({ ListProduct: PromotionProductMatch, ProductGroup: PromotionGroupMatch, Discount: PromotionDiscountMatch })
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

comparePromotion.post('/summaryCompare', async (req, res) => {
    try {
        await RewardSummary.deleteOne(req.body)
        const response = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/compare', req.body)
        const data = response.data
        const freeItem = []
        const discountItem = []

        // Process free items
        for (const list of data.ListProduct) {
            for (let subList of list.TotalReward) {
                if (subList.productId == list.productId) {
                    subList.proId = list.proId
                    freeItem.push(subList)
                }
            }
        }
        for (const list of data.ProductGroup) {
            let idProduct = ''
            let nameProduct = ''
            const uniqListProduct = _.uniqBy(list.listProduct, 'id')
            for (const subList of list.listProductReward) {
                for (const memberList of uniqListProduct) {
                    if (memberList.id == subList.id) {
                        idProduct = subList.id
                        nameProduct = subList.name
                    }
                }
            }
            const dataPro = await Promotion.findOne({ proId: list.proId })
            const unitThai = await Unit.findOne({ nameEng: list.qtyUnit })
            freeItem.push({
                productId: idProduct,
                productName: slicePackSize(nameProduct),
                qty: list.qtyReward,
                qtyText: list.qtyReward + ' ' + unitThai.nameThai,
                unitQty: unitThai.idUnit,
                unitQtyThai: unitThai.nameThai,
                proId: list.proId,
                proName: dataPro.name,
                proType: dataPro.proType
            })
        }

        // Process discount items
        for (const list of data.Discount) {
            discountItem.push({
                productId: list.productId,
                proId: list.proId,
                discount: list.discount,
                TotalPurchasedQuantity: list.TotalPurchasedQuantity
            })
        }

        // Combine and save the data
        const combinedProducts = {}
        freeItem.forEach(product => {
            const { proId, proName, qty, qtyText, ...rest } = product
            if (!combinedProducts[proId]) {
                rest.qty = qty
                rest.qtyText = qtyText
                combinedProducts[proId] = { summaryQty: qty, products: [rest], proName }
            } else {
                combinedProducts[proId].summaryQty += qty
                rest.qty = qty
                rest.qtyText = qtyText
                combinedProducts[proId].products.push(rest)
            }
        })

        const resultArray = Object.keys(combinedProducts).map(proId => ({
            proId,
            proName: combinedProducts[proId].proName,
            summaryQty: combinedProducts[proId].summaryQty,
            listProduct: combinedProducts[proId].products,
        }))

        const saveData = {
            area: req.body.area,
            storeId: req.body.storeId,
            listPromotion: resultArray
        }

        await RewardSummary.create(saveData)
        const queryData = await RewardSummary.findOne(req.body, { _id: 0, 'listPromotion._id': 0, 'listPromotion.listProduct._id': 0 })
        const listFree = queryData.listPromotion
        await createLog('200', req.method, req.originalUrl, res.body, 'getSummary Compare Successfully')

        res.status(200).json({ area: req.body.area, storeId: req.body.storeId, listFree, listDiscount: discountItem })
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = comparePromotion
