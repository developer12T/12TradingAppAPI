const express = require('express')
require('../../configs/connect')
const { Promotion, RewardSummary } = require("../../models/promotion")
const { Unit, Product } = require("../../models/product")
const _ = require("lodash")
const { calPromotion, slicePackSize } = require("../../utils/utility")
const { createLog } = require("../../services/errorLog")
const axios = require("axios")
const { log } = require('winston')
const { restart } = require('nodemon')
const comparePromotion = express.Router()

// const matchConditions = (promotion, listGroup, req, typeStore) => {
//     const conditions = promotion.conditions[0];

//     const storeMatches = promotion.store.length === 0 || promotion.store.includes(req.body.storeId);
//     const typeStoreMatches = promotion.typeStore.length === 0 || promotion.typeStore.includes(typeStore);
//     const areaMatches = promotion.area.length === 0 || promotion.area.includes(req.body.area);
//     const exceptMatches = promotion.except.length === 0 || !promotion.except.includes(req.body.storeId);
//     const groupMatches = conditions.productGroup.length === 0 || conditions.productGroup.includes(listGroup.group);
//     const brandMatches = conditions.productBrand.length === 0 || conditions.productBrand.includes(listGroup.brand);
//     const sizeMatches = conditions.productSize.length === 0 || conditions.productSize.includes(listGroup.size);
//     // const unitMatches = conditions.productUnit.length === 0 || conditions.productUnit.includes(listGroup.qtyUnitId);
//     // const qtyMatches = conditions.productQty === 0 || listGroup.qtyPurc >= conditions.productQty;

//     return storeMatches && typeStoreMatches && areaMatches && exceptMatches &&
//         groupMatches && brandMatches && sizeMatches;
// }

// const calculateRewardQty = (totalAmount, productAmount, productQty) => {
//     // Check if totalAmount is greater than or equal to the required amount
//     if (totalAmount >= productAmount) {
//         const reward = Math.floor(totalAmount / productAmount) * productQty;
//         return reward;
//     }
//     return 0;
// }

// comparePromotion.post('/compare', async (req, res) => {
//     try {
//         const { calPromotion } = require('../../utils/utility')
//         const PromotionProductMatch = []
//         const PromotionGroupMatch = []
//         const PromotionDiscountMatch = []

//         const dataSummary = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/getSummaryCart', {
//             area: req.body.area,
//             storeId: req.body.storeId
//         })

//         const typeStore = dataSummary.data.typeStore
//         // console.log('52',typeStore);
//         const totalAmount = dataSummary.data.list.totalAmount

//         for (const listGroup of dataSummary.data.list.listProduct) {
//             const dataPromotion = await Promotion.find({ 'conditions': { $elemMatch: { productId: listGroup.id } } })
//             if (dataPromotion && dataPromotion.length > 0) {
//                 for (const listDataPromotion of dataPromotion) {
//                     for (const itemList of listDataPromotion.conditions) {
//                         if (listDataPromotion.proType === 'free' && itemList.productQty === 0 && itemList.productAmount > 0) {
//                             if (totalAmount >= itemList.productAmount) {
//                                 const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId })
//                                 const ttReward = []
//                                 for (const listRewardData of rewardData.rewards) {
//                                     const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
//                                     const productDetail = await Product.findOne({ id: listRewardData.productId })
//                                     ttReward.push({
//                                         productId: listRewardData.productId,
//                                         productName: productDetail ? productDetail.name : '',
//                                         qty: listRewardData.productQty,
//                                         unitQty: dataUnitName1 ? dataUnitName1.nameEng : ''
//                                     })
//                                 }
//                                 const data_obj = {
//                                     productId: listGroup.id,
//                                     proId: listDataPromotion.proId,
//                                     proCode: listDataPromotion.proCode,
//                                     TotalPurchasedQuantity: {
//                                         productId: listGroup.id,
//                                         qty: listGroup.qtyPurc,
//                                         nameQty: listGroup.qtyUnitName
//                                     },
//                                     TotalReward: ttReward
//                                 }
//                                 PromotionProductMatch.push(data_obj)
//                             }
//                         } else if (itemList.productUnit === listGroup.qtyUnitId) {
//                             if (listGroup.qtyPurc >= itemList.productQty) {
//                                 if (listDataPromotion.proType === 'discount') {
//                                     const discountPerUnit = listDataPromotion.discounts[0].amount
//                                     const discountTotal = Math.floor(listGroup.qtyPurc / itemList.productQty) * discountPerUnit
//                                     const data_obj = {
//                                         productId: listGroup.id,
//                                         proId: listDataPromotion.proId,
//                                         discount: discountTotal
//                                     }
//                                     PromotionDiscountMatch.push(data_obj)
//                                 } else if (listDataPromotion.proType === 'free') {
//                                     const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId })
//                                     const ttReward = []
//                                     for (const listRewardData of rewardData.rewards) {
//                                         const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
//                                         const productDetail = await Product.findOne({ id: listRewardData.productId })
//                                         ttReward.push({
//                                             productId: listRewardData.productId,
//                                             productName: productDetail ? productDetail.name : '',
//                                             qty: await calPromotion(listGroup.qtyPurc, itemList.productQty, listRewardData.productQty),
//                                             unitQty: dataUnitName1 ? dataUnitName1.nameEng : ''
//                                         })
//                                     }
//                                     const data_obj = {
//                                         productId: listGroup.id,
//                                         proId: listDataPromotion.proId,
//                                         proCode: listDataPromotion.proCode,
//                                         TotalPurchasedQuantity: {
//                                             productId: listGroup.id,
//                                             qty: listGroup.qtyPurc,
//                                             nameQty: listGroup.qtyUnitName
//                                         },
//                                         TotalReward: ttReward
//                                     }
//                                     PromotionProductMatch.push(data_obj)
//                                 }
//                             }
//                         } else {
//                             const convertChange = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: listGroup.qtyUnitId } } }, { 'convertFact.$': 1 })
//                             const convertChangePro = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: itemList.productUnit } } }, { 'convertFact.$': 1 })

//                             if (convertChange && convertChangePro) {
//                                 if ((listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor >= itemList.productQty) {
//                                     if (listDataPromotion.proType === 'discount') {
//                                         const discountPerUnit = listDataPromotion.discounts[0].amount
//                                         const discountTotal = Math.floor((listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor / itemList.productQty) * discountPerUnit
//                                         const data_obj = {
//                                             productId: listGroup.id,
//                                             proId: listDataPromotion.proId,
//                                             discount: discountTotal
//                                         }
//                                         PromotionDiscountMatch.push(data_obj)
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         // ตรวจสอบกลุ่มสินค้าทีละกลุ่ม
//         for (const listGroup of dataSummary.data.list.listProductGroup) {
//             const dataPromotionGroup = await Promotion.find({})
//             if (dataPromotionGroup.length > 0) {
//                 for (const listGroupPromotion of dataPromotionGroup) {
//                     if (await matchConditions(listGroupPromotion, listGroup, req, typeStore)) {
//                         for (const itemBuyList of listGroupPromotion.conditions) {
//                             // console.log('57',listGroupPromotion.conditions);
//                             if (listGroupPromotion.proType === 'free' && itemBuyList.productQty === 0 && itemBuyList.productAmount > 0) {
//                                 if (totalAmount >= itemBuyList.productAmount) {
//                                     const rewardQty = calculateRewardQty(totalAmount, itemBuyList.productAmount, listGroupPromotion.rewards[0].productQty);
//                                     const rewards = await Promise.all(listGroupPromotion.rewards.map(async (reward) => {
//                                         const dataUnitName1 = await Unit.findOne({ idUnit: reward.productUnit });
//                                         const searchConditions = { "convertFact.unitId": { $ne: '3' } };

//                                         if (reward.productGroup) {
//                                             searchConditions.group = reward.productGroup;
//                                         }
//                                         if (reward.productSize) {
//                                             searchConditions.size = reward.productSize;
//                                         }
//                                         if (reward.productFlavour) {
//                                             searchConditions.flavour = reward.productFlavour;
//                                         }
//                                         if (reward.productBrand) {
//                                             searchConditions.brand = reward.productBrand;
//                                         }

//                                         const dataRewardItem = await Product.find(searchConditions, { id: 1, _id: 0, name: 1 });
//                                         console.log('58', searchConditions);
//                                         console.log('59', dataRewardItem);
//                                         return {
//                                             productId: reward.productGroup,
//                                             qty: rewardQty,
//                                             unitQty: dataUnitName1 ? dataUnitName1.nameEng : '',
//                                             listProductReward: dataRewardItem
//                                         };
//                                     }));

//                                     PromotionGroupMatch.push({
//                                         group: listGroup.group,
//                                         size: listGroup.size,
//                                         proId: listGroupPromotion.proId,
//                                         proCode: listGroupPromotion.proCode,
//                                         qtyReward: _.sumBy(rewards, 'qty'),
//                                         qtyUnit: rewards.map(r => r.unitQty).join(', '),
//                                         listProductReward: rewards.flatMap(r => r.listProductReward),
//                                         listProduct: listGroup.listProduct
//                                     });
//                                 }
//                             } else {
//                                 const unitDetail = await Unit.findOne({ idUnit: itemBuyList.productUnit });
//                                 const filterData = _.filter(listGroup.converterUnit, { 'name': unitDetail ? unitDetail.nameEng : '' });

//                                 if (filterData.length > 0 && filterData[0].qty >= itemBuyList.productQty) {
//                                     if (listGroupPromotion.proType === 'discount') {
//                                         const discountPerUnit = listGroupPromotion.discounts[0].amount;
//                                         const discountTotal = Math.floor(filterData[0].qty / itemBuyList.productQty) * discountPerUnit;
//                                         PromotionDiscountMatch.push({
//                                             group: listGroup.group,
//                                             size: listGroup.size,
//                                             proId: listGroupPromotion.proId,
//                                             discount: discountTotal,
//                                             listProduct: listGroup.listProduct
//                                         });
//                                     } else if (listGroupPromotion.proType === 'free') {
//                                         const rewards = await Promise.all(listGroupPromotion.rewards.map(async (reward) => {
//                                             const dataUnitName1 = await Unit.findOne({ idUnit: reward.productUnit });
//                                             const searchConditions = { "convertFact.unitId": { $ne: '3' } };

//                                             if (reward.productGroup) {
//                                                 searchConditions.group = reward.productGroup;
//                                             }
//                                             if (reward.productSize) {
//                                                 searchConditions.size = reward.productSize;
//                                             }
//                                             if (reward.productFlavour) {
//                                                 searchConditions.flavour = reward.productFlavour;
//                                             }
//                                             if (reward.productBrand) {
//                                                 searchConditions.brand = reward.productBrand;
//                                             }

//                                             const dataRewardItem = await Product.find(searchConditions, { id: 1, _id: 0, name: 1 });
//                                             return {
//                                                 productId: reward.productGroup,
//                                                 qty: await calPromotion(filterData[0].qty, itemBuyList.productQty, reward.productQty),
//                                                 unitQty: dataUnitName1 ? dataUnitName1.nameEng : '',
//                                                 listProductReward: dataRewardItem
//                                             };
//                                         }));
//                                         PromotionGroupMatch.push({
//                                             group: listGroup.group,
//                                             size: listGroup.size,
//                                             proId: listGroupPromotion.proId,
//                                             proCode: listGroupPromotion.proCode,
//                                             qtyReward: _.sumBy(rewards, 'qty'),
//                                             qtyUnit: rewards.map(r => r.unitQty).join(', '),
//                                             listProductReward: rewards.flatMap(r => r.listProductReward),
//                                             listProduct: listGroup.listProduct
//                                         });
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         const combinedPromotions = {
//             ListProduct: PromotionProductMatch,
//             ProductGroup: [],
//             Discount: PromotionDiscountMatch
//         };

//         // Combine ProductGroup promotions
//         const groupByProId = _.groupBy(PromotionGroupMatch, 'proId');
//         for (const proId in groupByProId) {
//             const groupPromotions = groupByProId[proId];
//             const firstGroup = groupPromotions[0];

//             const combinedGroupPromotion = {
//                 group: firstGroup.group,
//                 size: firstGroup.size,
//                 proId: firstGroup.proId,
//                 proCode: firstGroup.proCode,
//                 qtyReward: _.sumBy(groupPromotions, 'qtyReward'),
//                 qtyUnit: firstGroup.qtyUnit,
//                 listProductReward: _.flatMap(groupPromotions, 'listProductReward'),
//                 listProduct: firstGroup.listProduct
//             };

//             combinedPromotions.ProductGroup.push(combinedGroupPromotion);
//         }

//         await createLog('200', req.method, req.originalUrl, res.body, 'getCompare successfully')
//         res.status(200).json(combinedPromotions);
//     } catch (error) {
//         console.log(error)
//         await createLog('500', req.method, req.originalUrl, res.body, error.message)
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         })
//     }
// })

// // comparePromotion.post('/compare', async (req, res) => {
// //     try {
// //         const { calPromotion } = require('../../utils/utility')
// //         const PromotionProductMatch = []
// //         const PromotionGroupMatch = []
// //         const PromotionDiscountMatch = []

// //         const dataSummary = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/getSummaryCart', {
// //             area: req.body.area,
// //             storeId: req.body.storeId
// //         })

// //         const totalAmount = dataSummary.data.list.totalAmount

// //         for (const listGroup of dataSummary.data.list.listProduct) {
// //             const dataPromotion = await Promotion.find({ 'conditions': { $elemMatch: { productId: listGroup.id } } })
// //             if (dataPromotion && dataPromotion.length > 0) {
// //                 for (const listDataPromotion of dataPromotion) {
// //                     for (const itemList of listDataPromotion.conditions) {
// //                         if (listDataPromotion.proType === 'free' && itemList.productQty === 0 && itemList.productAmount > 0) {
// //                             if (totalAmount >= itemList.productAmount) {
// //                                 const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId })
// //                                 const ttReward = []
// //                                 for (const listRewardData of rewardData.rewards) {
// //                                     const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
// //                                     const productDetail = await Product.findOne({ id: listRewardData.productId })
// //                                     ttReward.push({
// //                                         productId: listRewardData.productId,
// //                                         productName: productDetail ? productDetail.name : '',
// //                                         qty: listRewardData.productQty,
// //                                         unitQty: dataUnitName1 ? dataUnitName1.nameEng : ''
// //                                     })
// //                                 }
// //                                 const data_obj = {
// //                                     productId: listGroup.id,
// //                                     proId: listDataPromotion.proId,
// //                                     proCode: listDataPromotion.proCode,
// //                                     TotalPurchasedQuantity: {
// //                                         productId: listGroup.id,
// //                                         qty: listGroup.qtyPurc,
// //                                         nameQty: listGroup.qtyUnitName
// //                                     },
// //                                     TotalReward: ttReward
// //                                 }
// //                                 PromotionProductMatch.push(data_obj)
// //                             }
// //                         } else if (itemList.productUnit === listGroup.qtyUnitId) {
// //                             if (listGroup.qtyPurc >= itemList.productQty) {
// //                                 if (listDataPromotion.proType === 'discount') {
// //                                     const discountPerUnit = listDataPromotion.discounts[0].amount
// //                                     const discountTotal = Math.floor(listGroup.qtyPurc / itemList.productQty) * discountPerUnit
// //                                     const data_obj = {
// //                                         productId: listGroup.id,
// //                                         proId: listDataPromotion.proId,
// //                                         discount: discountTotal
// //                                     }
// //                                     PromotionDiscountMatch.push(data_obj)
// //                                 } else if (listDataPromotion.proType === 'free') {
// //                                     const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId })
// //                                     const ttReward = []
// //                                     for (const listRewardData of rewardData.rewards) {
// //                                         const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
// //                                         const productDetail = await Product.findOne({ id: listRewardData.productId })
// //                                         ttReward.push({
// //                                             productId: listRewardData.productId,
// //                                             productName: productDetail ? productDetail.name : '',
// //                                             qty: await calPromotion(listGroup.qtyPurc, itemList.productQty, listRewardData.productQty),
// //                                             unitQty: dataUnitName1 ? dataUnitName1.nameEng : ''
// //                                         })
// //                                     }
// //                                     const data_obj = {
// //                                         productId: listGroup.id,
// //                                         proId: listDataPromotion.proId,
// //                                         proCode: listDataPromotion.proCode,
// //                                         TotalPurchasedQuantity: {
// //                                             productId: listGroup.id,
// //                                             qty: listGroup.qtyPurc,
// //                                             nameQty: listGroup.qtyUnitName
// //                                         },
// //                                         TotalReward: ttReward
// //                                     }
// //                                     PromotionProductMatch.push(data_obj)
// //                                 }
// //                             }
// //                         } else {
// //                             const convertChange = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: listGroup.qtyUnitId } } }, { 'convertFact.$': 1 })
// //                             const convertChangePro = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: itemList.productUnit } } }, { 'convertFact.$': 1 })

// //                             if (convertChange && convertChangePro) {
// //                                 if ((listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor >= itemList.productQty) {
// //                                     if (listDataPromotion.proType === 'discount') {
// //                                         const discountPerUnit = listDataPromotion.discounts[0].amount
// //                                         const discountTotal = Math.floor((listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor / itemList.productQty) * discountPerUnit
// //                                         const data_obj = {
// //                                             productId: listGroup.id,
// //                                             proId: listDataPromotion.proId,
// //                                             discount: discountTotal
// //                                         }
// //                                         PromotionDiscountMatch.push(data_obj)
// //                                     }
// //                                 }
// //                             }
// //                         }
// //                     }
// //                 }
// //             }
// //         }

// //         // ตรวจสอบกลุ่มสินค้าทีละกลุ่ม
// //         for (const listGroup of dataSummary.data.list.listProductGroup) {
// //             const dataPromotionGroup = await Promotion.find({})
// //             // console.log('333',dataPromotionGroup);
// //             if (dataPromotionGroup.length > 0) {
// //                 for (const listGroupPromotion of dataPromotionGroup) {
// //                     // console.log('777',listGroup);
// //                     if (matchConditions(listGroupPromotion, listGroup, req)) {
// //                     for (const itemBuyList of listGroupPromotion.conditions) {
// //                         if (listGroupPromotion.proType === 'free' && itemBuyList.productQty === 0 && itemBuyList.productAmount > 0) {
// //                             if (totalAmount >= itemBuyList.productAmount) {
// //                                 const ttRewardGroup = []
// //                                 const rewardDataGroup = await Promotion.findOne({ proId: listGroupPromotion.proId })
// //                                 for (const listRewardData of rewardDataGroup.rewards) {
// //                                     const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
// //                                     const dataRewardItem = await Product.find({ group: listRewardData.productGroup, size: listRewardData.productSize, "convertFact.unitId": { $ne: '3' } }, { id: 1, _id: 0, name: 1 })
// //                                     ttRewardGroup.push({
// //                                         productId: listRewardData.productGroup,
// //                                         qty: listRewardData.productQty,
// //                                         unitQty: dataUnitName1 ? dataUnitName1.nameEng : ''
// //                                     })
// //                                     const data_obj = {
// //                                         group: listGroup.group,
// //                                         size: listGroup.size,
// //                                         proId: listGroupPromotion.proId,
// //                                         proCode: listGroupPromotion.proCode,
// //                                         qtyReward: listRewardData.productQty,
// //                                         qtyUnit: dataUnitName1 ? dataUnitName1.nameEng : '',
// //                                         listProductReward: dataRewardItem,
// //                                         listProduct: listGroup.listProduct
// //                                     }
// //                                     PromotionGroupMatch.push(data_obj)
// //                                 }
// //                             }

// //                         } else {
// //                             const unitDetail = await Unit.findOne({ idUnit: itemBuyList.productUnit })
// //                             const filterData = _.filter(listGroup.converterUnit, { 'name': unitDetail ? unitDetail.nameEng : '' })

// //                             if (filterData.length > 0 && filterData[0].qty >= itemBuyList.productQty) {
// //                                 if (listGroupPromotion.proType === 'discount') {
// //                                     const discountPerUnit = listGroupPromotion.discounts[0].amount
// //                                     const discountTotal = Math.floor(filterData[0].qty / itemBuyList.productQty) * discountPerUnit
// //                                     PromotionDiscountMatch.push({
// //                                         group: listGroup.group,
// //                                         size: listGroup.size,
// //                                         proId: listGroupPromotion.proId,
// //                                         discount: discountTotal,
// //                                         listProduct: listGroup.listProduct
// //                                     })
// //                                 } else if (listGroupPromotion.proType === 'free') {
// //                                     const ttRewardGroup = []
// //                                     const rewardDataGroup = await Promotion.findOne({ proId: listGroupPromotion.proId })
// //                                     for (const listRewardData of rewardDataGroup.rewards) {
// //                                         const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit })
// //                                         const dataRewardItem = await Product.find({ group: listRewardData.productGroup, size: listRewardData.productSize, "convertFact.unitId": { $ne: '3' } }, { id: 1, _id: 0, name: 1 })
// //                                         ttRewardGroup.push({
// //                                             productId: listRewardData.productGroup,
// //                                             qty: await calPromotion(filterData[0].qty, itemBuyList.productQty, listRewardData.productQty),
// //                                             unitQty: dataUnitName1 ? dataUnitName1.nameEng : ''
// //                                         })
// //                                         const data_obj = {
// //                                             group: listGroup.group,
// //                                             size: listGroup.size,
// //                                             proId: listGroupPromotion.proId,
// //                                             proCode: listGroupPromotion.proCode,
// //                                             qtyReward: await calPromotion(filterData[0].qty, itemBuyList.productQty, listRewardData.productQty),
// //                                             qtyUnit: dataUnitName1 ? dataUnitName1.nameEng : '',
// //                                             listProductReward: dataRewardItem,
// //                                             listProduct: listGroup.listProduct
// //                                         }
// //                                         PromotionGroupMatch.push(data_obj)
// //                                     }
// //                                 }
// //                             }
// //                         }
// //                     }
// //                 }
// //                 }
// //             }
// //         }

// //         const combinedPromotions = {
// //             ListProduct: PromotionProductMatch,
// //             ProductGroup: [],
// //             Discount: PromotionDiscountMatch
// //         };

// //         // Combine ProductGroup promotions
// //         const groupByProId = _.groupBy(PromotionGroupMatch, 'proId');
// //         for (const proId in groupByProId) {
// //             const groupPromotions = groupByProId[proId];
// //             const firstGroup = groupPromotions[0];

// //             const combinedGroupPromotion = {
// //                 group: firstGroup.group,
// //                 size: firstGroup.size,
// //                 proId: firstGroup.proId,
// //                 proCode: firstGroup.proCode,
// //                 qtyReward: _.sumBy(groupPromotions, 'qtyReward'),
// //                 qtyUnit: firstGroup.qtyUnit,
// //                 listProductReward: _.flatMap(groupPromotions, 'listProductReward'),
// //                 listProduct: firstGroup.listProduct
// //             };

// //             combinedPromotions.ProductGroup.push(combinedGroupPromotion);
// //         }

// //         await createLog('200', req.method, req.originalUrl, res.body, 'getCompare successfully')
// //         res.status(200).json(combinedPromotions);
// //     } catch (error) {
// //         console.log(error)
// //         await createLog('500', req.method, req.originalUrl, res.body, error.message)
// //         res.status(500).json({
// //             status: 500,
// //             message: error.message
// //         })
// //     }
// // })

// comparePromotion.post('/summaryCompare', async (req, res) => {
//     try {
//         await RewardSummary.deleteOne(req.body)
//         const response = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/compare', req.body)
//         const data = response.data
//         const freeItem = []
//         const discountItem = []

//         for (const list of data.ProductGroup) {
//             let idProduct = ''
//             let nameProduct = ''
//             const uniqListProduct = _.uniqBy(list.listProduct, 'id')
//             // console.log('123',uniqListProduct);
//             for (const subList of list.listProductReward) {
//                 const matchedProduct = uniqListProduct.find(memberList => memberList.id === subList.id)
//                 if (matchedProduct) {
//                     idProduct = matchedProduct.id
//                     nameProduct = matchedProduct.name
//                     break
//                 }
//             }

//             if (!idProduct) {
//                 const randomProduct = _.sample(list.listProductReward)
//                 // console.log('randomProduct', randomProduct)
//                 idProduct = randomProduct.id
//                 nameProduct = randomProduct.name
//             }

//             const dataPro = await Promotion.findOne({ proId: list.proId })
//             const unitThai = await Unit.findOne({ nameEng: list.qtyUnit })
//             freeItem.push({
//                 productId: idProduct,
//                 productName: slicePackSize(nameProduct),
//                 qty: list.qtyReward,
//                 qtyText: list.qtyReward + ' ' + (unitThai ? unitThai.nameThai : ''),
//                 unitQty: unitThai ? unitThai.idUnit : '',
//                 unitQtyThai: unitThai ? unitThai.nameThai : '',
//                 proId: list.proId,
//                 proCode: dataPro.proCode,
//                 proName: dataPro ? dataPro.name : '',
//                 proType: dataPro ? dataPro.proType : ''
//             })
//         }

//         const combinedProducts = {}
//         freeItem.forEach(product => {
//             const { proId, proCode, proName, qty, qtyText, ...rest } = product
//             if (!combinedProducts[proId]) {
//                 rest.proCode = proCode
//                 rest.qty = qty
//                 rest.qtyText = qtyText
//                 combinedProducts[proId] = { summaryQty: qty, products: [rest], proName, proCode }
//             } else {
//                 rest.proCode = proCode
//                 combinedProducts[proId].summaryQty += qty
//                 rest.qty = qty
//                 rest.qtyText = qtyText
//                 combinedProducts[proId].products.push(rest)
//             }
//         })

//         for (const list of data.Discount) {
//             const dataPro = await Promotion.findOne({ proId: list.proId });
//             if (list.listProduct && list.listProduct.length > 0) {
//                 list.listProduct.forEach(product => {
//                     discountItem.push({
//                         productId: product.id,
//                         productName: product.name,
//                         proId: list.proId,
//                         proName: dataPro ? dataPro.name : '',
//                         discount: dataPro ? dataPro.discounts[0].amount : 0,
//                         totalDiscount: parseFloat(parseFloat(list.discount).toFixed(2)),
//                     });
//                 });
//             }
//         }

//         const resultArray = Object.keys(combinedProducts).map(proId => ({
//             proId,
//             proCode: combinedProducts[proId].proCode,
//             proName: combinedProducts[proId].proName,
//             summaryQty: combinedProducts[proId].summaryQty,
//             listProduct: combinedProducts[proId].products,
//         }))

//         const saveData = {
//             area: req.body.area,
//             storeId: req.body.storeId,
//             listPromotion: resultArray
//         }

//         await RewardSummary.create(saveData)
//         const queryData = await RewardSummary.findOne(req.body, { _id: 0, 'listPromotion._id': 0, 'listPromotion.listProduct._id': 0 })
//         const listFree = queryData.listPromotion
//         await createLog('200', req.method, req.originalUrl, res.body, 'getSummary Compare Successfully')

//         res.status(200).json({ area: req.body.area, storeId: req.body.storeId, listFree, listDiscount: discountItem })
//     } catch (error) {
//         console.log(error)
//         await createLog('500', req.method, req.originalUrl, res.body, error.message)
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         })
//     }
// })

const matchConditions = (promotion, listGroup, req, typeStore) => {
    const { conditions, store, typeStore: promoTypeStore, area, except } = promotion;
    const { storeId, area: reqArea } = req.body;
    const { group, brand, size } = listGroup;

    return (store.length === 0 || store.includes(storeId)) &&
        (promoTypeStore.length === 0 || promoTypeStore.includes(typeStore)) &&
        (area.length === 0 || area.includes(reqArea)) &&
        (except.length === 0 || !except.includes(storeId)) &&
        (conditions[0].productGroup.length === 0 || conditions[0].productGroup.includes(group)) &&
        (conditions[0].productBrand.length === 0 || conditions[0].productBrand.includes(brand)) &&
        (conditions[0].productSize.length === 0 || conditions[0].productSize.includes(size));
};

const calculateRewardQty = (totalAmount, productAmount, productQty) => {
    return totalAmount >= productAmount ? Math.floor(totalAmount / productAmount) * productQty : 0;
};

const getUnitName = async (unitId) => {
    const unit = await Unit.findOne({ idUnit: unitId });
    return unit ? unit.nameEng : '';
};

const fetchProductDetails = async (reward) => {
    const searchConditions = {
        "convertFact.unitId": { $ne: '3' },
        ...(reward.productId && { id: reward.productId }),
        ...(reward.productGroup && { group: reward.productGroup }),
        ...(reward.productSize && { size: reward.productSize }),
        ...(reward.productFlavour && { flavour: reward.productFlavour }),
        ...(reward.productBrand && { brand: reward.productBrand }),
    };
    return Product.find(searchConditions, { id: 1, _id: 0, name: 1 });
};

const calculateDiscount = (qty, productQty, discountPerUnit) => {
    return Math.floor(qty / productQty) * discountPerUnit;
};

// comparePromotion.post('/compare', async (req, res) => {
//     try {
//         const PromotionProductMatch = [];
//         const PromotionGroupMatch = [];
//         const PromotionDiscountMatch = [];
//         const NewStorePromotions = [];
//         let appliedPromotions = new Set();

//         const { data } = await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/getSummaryCart`, {
//             area: req.body.area,
//             storeId: req.body.storeId
//         });

//         const { typeStore, list: { totalAmount, listProduct, listProductGroup } } = data;

//         // Check if the store is new
//         let isStoreNew = false;
//         try {
//             const storeNewResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/store/getStoreNew`, {
//                 area: req.body.area
//             });
//             isStoreNew = storeNewResponse.data.some(store => store.storeId === req.body.storeId);
//         } catch (err) {
//             console.log('Error fetching new store status:', err.message);
//         }

//         // Check if the store has no previous orders
//         let hasNoOrder = false;
//         if (isStoreNew) {
//             try {
//                 const { data } = await axios.post(`${process.env.API_URL_IN_USE}/cms/order/getOrderCustomer`, {
//                     customer: req.body.storeId
//                 });
//                 if (data.status === 204) {
//                     hasNoOrder = true;
//                 }
//             } catch (err) {
//                 console.log(err.message);
//             }
//         }

//         // Process individual products
//         for (const listGroup of listProduct) {
//             const dataPromotion = await Promotion.find({ 'conditions': { $elemMatch: { productId: listGroup.id } } });
//             if (dataPromotion.length > 0) {
//                 for (const listDataPromotion of dataPromotion) {
//                     for (const itemList of listDataPromotion.conditions) {
//                         if (listDataPromotion.proType === 'free' && itemList.productQty === 0 && itemList.productAmount > 0) {
//                             if (totalAmount >= itemList.productAmount) {
//                                 const ttReward = [];
//                                 const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId });
//                                 for (const listRewardData of rewardData.rewards) {
//                                     const productDetail = await Product.findOne({ id: listRewardData.productId });
//                                     ttReward.push({
//                                         productId: listRewardData.productId,
//                                         productName: productDetail ? productDetail.name : '',
//                                         qty: listRewardData.productQty,
//                                         unitQty: await getUnitName(listRewardData.productUnit)
//                                     });
//                                 }
//                                 PromotionProductMatch.push({
//                                     productId: listGroup.id,
//                                     proId: listDataPromotion.proId,
//                                     proCode: listDataPromotion.proCode,
//                                     TotalPurchasedQuantity: {
//                                         productId: listGroup.id,
//                                         qty: listGroup.qtyPurc,
//                                         nameQty: listGroup.qtyUnitName
//                                     },
//                                     TotalReward: ttReward
//                                 });
//                             }
//                         } else if (itemList.productUnit === listGroup.qtyUnitId && listGroup.qtyPurc >= itemList.productQty) {
//                             if (listDataPromotion.proType === 'discount') {
//                                 const discountTotal = calculateDiscount(listGroup.qtyPurc, itemList.productQty, listDataPromotion.discounts[0].amount);
//                                 PromotionDiscountMatch.push({
//                                     productId: listGroup.id,
//                                     proId: listDataPromotion.proId,
//                                     discount: discountTotal
//                                 });
//                             } else if (listDataPromotion.proType === 'free') {
//                                 const ttReward = [];
//                                 const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId });
//                                 for (const listRewardData of rewardData.rewards) {
//                                     const productDetail = await Product.findOne({ id: listRewardData.productId });
//                                     ttReward.push({
//                                         productId: listRewardData.productId,
//                                         productName: productDetail ? productDetail.name : '',
//                                         qty: await calPromotion(listGroup.qtyPurc, itemList.productQty, listRewardData.productQty),
//                                         unitQty: await getUnitName(listRewardData.productUnit)
//                                     });
//                                 }
//                                 PromotionProductMatch.push({
//                                     productId: listGroup.id,
//                                     proId: listDataPromotion.proId,
//                                     proCode: listDataPromotion.proCode,
//                                     TotalPurchasedQuantity: {
//                                         productId: listGroup.id,
//                                         qty: listGroup.qtyPurc,
//                                         nameQty: listGroup.qtyUnitName
//                                     },
//                                     TotalReward: ttReward
//                                 });
//                             }
//                         } else {
//                             const convertChange = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: listGroup.qtyUnitId } } }, { 'convertFact.$': 1 });
//                             const convertChangePro = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: itemList.productUnit } } }, { 'convertFact.$': 1 });

//                             if (convertChange && convertChangePro) {
//                                 const convertedQty = (listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor;
//                                 if (convertedQty >= itemList.productQty) {
//                                     if (listDataPromotion.proType === 'discount') {
//                                         const discountTotal = calculateDiscount(convertedQty, itemList.productQty, listDataPromotion.discounts[0].amount);
//                                         PromotionDiscountMatch.push({
//                                             productId: listGroup.id,
//                                             proId: listDataPromotion.proId,
//                                             discount: discountTotal
//                                         });
//                                     } 
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         // Process product groups
//         for (const listGroup of listProductGroup) {
//             const dataPromotionGroup = await Promotion.find({});
//             for (const listGroupPromotion of dataPromotionGroup) {
//                 if (await matchConditions(listGroupPromotion, listGroup, req, typeStore)) {
//                     for (const itemBuyList of listGroupPromotion.conditions) {
//                         const promotionKey = `${listGroupPromotion.proId}_${listGroup.group}`;

//                         // ตรวจสอบรสชาติและกลุ่มสินค้า
//                         const flavourMatch = itemBuyList.productFlavour.length === 0 || itemBuyList.productFlavour.includes(listGroup.flavour);
//                         const matchingUnit = listGroup.converterUnit.find(unit => unit.unitId === itemBuyList.productUnit[0]);
//                         const conditionQtyInUnit = matchingUnit ? matchingUnit.qty : 0;

//                         if (flavourMatch) {
//                             if (listGroupPromotion.proType === 'free') {
//                                 if (itemBuyList.productQty === 0 && itemBuyList.productAmount > 0) {
//                                     if (totalAmount >= itemBuyList.productAmount && !appliedPromotions.has(promotionKey)) {
//                                         const rewards = await Promise.all(listGroupPromotion.rewards.map(async (reward) => {
//                                             const dataRewardItem = await fetchProductDetails(reward);
//                                             return {
//                                                 productId: reward.productGroup,
//                                                 qty: calculateRewardQty(totalAmount, itemBuyList.productAmount, reward.productQty),
//                                                 unitQty: await getUnitName(reward.productUnit),
//                                                 listProductReward: dataRewardItem
//                                             };
//                                         }));

//                                         PromotionGroupMatch.push({
//                                             group: listGroup.group,
//                                             size: listGroup.size,
//                                             proId: listGroupPromotion.proId,
//                                             proCode: listGroupPromotion.proCode,
//                                             qtyReward: _.sumBy(rewards, 'qty'),
//                                             qtyUnit: rewards.map(r => r.unitQty).join(', '),
//                                             listProductReward: rewards.flatMap(r => r.listProductReward),
//                                             listProduct: listGroup.listProduct
//                                         });

//                                         appliedPromotions.add(promotionKey);
//                                     }
//                                 } else if (conditionQtyInUnit >= itemBuyList.productQty) {
//                                     const rewards = await Promise.all(listGroupPromotion.rewards.map(async (reward) => {
//                                         const dataRewardItem = await fetchProductDetails(reward);
//                                         return {
//                                             productId: reward.productGroup,
//                                             qty: await calPromotion(conditionQtyInUnit, itemBuyList.productQty, reward.productQty),
//                                             unitQty: await getUnitName(reward.productUnit),
//                                             listProductReward: dataRewardItem
//                                         };
//                                     }));

//                                     PromotionGroupMatch.push({
//                                         group: listGroup.group,
//                                         size: listGroup.size,
//                                         proId: listGroupPromotion.proId,
//                                         proCode: listGroupPromotion.proCode,
//                                         qtyReward: _.sumBy(rewards, 'qty'),
//                                         qtyUnit: rewards.map(r => r.unitQty).join(', '),
//                                         listProductReward: rewards.flatMap(r => r.listProductReward),
//                                         listProduct: listGroup.listProduct
//                                     });

//                                     appliedPromotions.add(promotionKey);
//                                 }
//                             } else if (listGroupPromotion.proType === 'discount' && conditionQtyInUnit >= itemBuyList.productQty) {
//                                 const discountTotal = calculateDiscount(conditionQtyInUnit, itemBuyList.productQty, listGroupPromotion.discounts[0].amount);
//                                 PromotionDiscountMatch.push({
//                                     group: listGroup.group,
//                                     size: listGroup.size,
//                                     proId: listGroupPromotion.proId,
//                                     discount: discountTotal,
//                                     listProduct: listGroup.listProduct
//                                 });
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         // Process new store promotions
//         if (isStoreNew && hasNoOrder) {
//             const dataPromotionGroup = await Promotion.find({ proType: 'new' });
//             for (const listGroupPromotion of dataPromotionGroup) {
//                 for (const itemBuyList of listGroupPromotion.conditions) {
//                     if (totalAmount >= itemBuyList.productAmount) {
//                         const rewards = await Promise.all(listGroupPromotion.rewards.map(async (reward) => {
//                             const dataRewardItem = await fetchProductDetails(reward);
//                             return {
//                                 productId: reward.productGroup,
//                                 qty: calculateRewardQty(totalAmount, itemBuyList.productAmount, reward.productQty),
//                                 unitQty: await getUnitName(reward.productUnit),
//                                 listProductReward: dataRewardItem
//                             };
//                         }));

//                         NewStorePromotions.push({
//                             proId: listGroupPromotion.proId,
//                             proCode: listGroupPromotion.proCode,
//                             qtyReward: _.sumBy(rewards, 'qty'),
//                             qtyUnit: rewards.map(r => r.unitQty).join(', '),
//                             listProductReward: rewards.flatMap(r => r.listProductReward),
//                             listProduct: []
//                         });

//                         appliedPromotions.add(listGroupPromotion.proId);
//                     }
//                 }
//             }
//         }

//         const combinedPromotions = {
//             ListProduct: PromotionProductMatch,
//             ProductGroup: [],
//             NewStore: NewStorePromotions,
//             Discount: PromotionDiscountMatch
//         };

//         const groupByProId = _.groupBy(PromotionGroupMatch, 'proId');
//         for (const proId in groupByProId) {
//             const groupPromotions = groupByProId[proId];
//             const firstGroup = groupPromotions[0];

//             const combinedGroupPromotion = {
//                 group: firstGroup.group,
//                 size: firstGroup.size,
//                 proId: firstGroup.proId,
//                 proCode: firstGroup.proCode,
//                 qtyReward: _.sumBy(groupPromotions, 'qtyReward'),
//                 qtyUnit: firstGroup.qtyUnit,
//                 listProductReward: _.flatMap(groupPromotions, 'listProductReward'),
//                 listProduct: firstGroup.listProduct
//             };

//             combinedPromotions.ProductGroup.push(combinedGroupPromotion);
//         }

//         await createLog('200', req.method, req.originalUrl, res.body, 'getCompare successfully');
//         res.status(200).json(combinedPromotions);
//     } catch (error) {
//         console.log(error);
//         await createLog('500', req.method, req.originalUrl, res.body, error.message);
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// });

comparePromotion.post('/compare', async (req, res) => {
    try {
        const PromotionProductMatch = [];
        const PromotionGroupMatch = [];
        const PromotionDiscountMatch = [];
        const NewStorePromotions = [];
        let appliedPromotions = new Set();

        const { data } = await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/getSummaryCart`, {
            area: req.body.area,
            storeId: req.body.storeId
        });

        const { typeStore, list: { totalAmount, listProduct, listProductGroup } } = data;

        // Check if the store is new
        let isStoreNew = false;
        try {
            const storeNewResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/store/getStoreNew`, {
                area: req.body.area
            });
            isStoreNew = storeNewResponse.data.some(store => store.storeId === req.body.storeId);
        } catch (err) {
            console.log('Error fetching new store status:', err.message);
        }

        // Check if the store has no previous orders
        let hasNoOrder = false;
        if (isStoreNew) {
            try {
                const { data } = await axios.post(`${process.env.API_URL_IN_USE}/cms/order/getOrderCustomer`, {
                    customer: req.body.storeId
                });
                if (data.status === 204) {
                    hasNoOrder = true;
                }
            } catch (err) {
                console.log(err.message);
            }
        }

        // Process individual products
        for (const listGroup of listProduct) {
            const dataPromotion = await Promotion.find({ 'conditions': { $elemMatch: { productId: listGroup.id } } });
            if (dataPromotion.length > 0) {
                for (const listDataPromotion of dataPromotion) {
                    for (const itemList of listDataPromotion.conditions) {
                        if (listDataPromotion.proType === 'free' && itemList.productQty === 0 && itemList.productAmount > 0) {
                            if (totalAmount >= itemList.productAmount) {
                                const ttReward = [];
                                const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId });
                                for (const listRewardData of rewardData.rewards) {
                                    const productDetail = await Product.findOne({ id: listRewardData.productId });
                                    ttReward.push({
                                        productId: listRewardData.productId,
                                        productName: productDetail ? productDetail.name : '',
                                        qty: listRewardData.productQty,
                                        unitQty: await getUnitName(listRewardData.productUnit)
                                    });
                                }
                                PromotionProductMatch.push({
                                    productId: listGroup.id,
                                    proId: listDataPromotion.proId,
                                    proCode: listDataPromotion.proCode,
                                    TotalPurchasedQuantity: {
                                        productId: listGroup.id,
                                        qty: listGroup.qtyPurc,
                                        nameQty: listGroup.qtyUnitName
                                    },
                                    TotalReward: ttReward
                                });
                            }
                        } else if (itemList.productUnit === listGroup.qtyUnitId && listGroup.qtyPurc >= itemList.productQty) {
                            if (listDataPromotion.proType === 'discount') {
                                const discountTotal = calculateDiscount(listGroup.qtyPurc, itemList.productQty, listDataPromotion.discounts[0].amount);
                                PromotionDiscountMatch.push({
                                    productId: listGroup.id,
                                    proId: listDataPromotion.proId,
                                    discount: discountTotal
                                });
                            } else if (listDataPromotion.proType === 'free') {
                                const ttReward = [];
                                const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId });
                                for (const listRewardData of rewardData.rewards) {
                                    const productDetail = await Product.findOne({ id: listRewardData.productId });
                                    ttReward.push({
                                        productId: listRewardData.productId,
                                        productName: productDetail ? productDetail.name : '',
                                        qty: await calPromotion(listGroup.qtyPurc, itemList.productQty, listRewardData.productQty),
                                        unitQty: await getUnitName(listRewardData.productUnit)
                                    });
                                }
                                PromotionProductMatch.push({
                                    productId: listGroup.id,
                                    proId: listDataPromotion.proId,
                                    proCode: listDataPromotion.proCode,
                                    TotalPurchasedQuantity: {
                                        productId: listGroup.id,
                                        qty: listGroup.qtyPurc,
                                        nameQty: listGroup.qtyUnitName
                                    },
                                    TotalReward: ttReward
                                });
                            }
                        } else {
                            const convertChange = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: listGroup.qtyUnitId } } }, { 'convertFact.$': 1 });
                            const convertChangePro = await Product.findOne({ id: listGroup.id, convertFact: { $elemMatch: { unitId: itemList.productUnit } } }, { 'convertFact.$': 1 });

                            if (convertChange && convertChangePro) {
                                const convertedQty = (listGroup.qtyPurc * convertChange.convertFact[0].factor) / convertChangePro.convertFact[0].factor;
                                if (convertedQty >= itemList.productQty) {
                                    if (listDataPromotion.proType === 'discount') {
                                        const discountTotal = calculateDiscount(convertedQty, itemList.productQty, listDataPromotion.discounts[0].amount);
                                        PromotionDiscountMatch.push({
                                            productId: listGroup.id,
                                            proId: listDataPromotion.proId,
                                            discount: discountTotal
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Process product groups
        for (const listGroup of listProductGroup) {
            const dataPromotionGroup = await Promotion.find({});
            for (const listGroupPromotion of dataPromotionGroup) {
                if (await matchConditions(listGroupPromotion, listGroup, req, typeStore)) {
                    for (const itemBuyList of listGroupPromotion.conditions) {
                        const promotionKey = `${listGroupPromotion.proId}_${listGroup.group}`;

                        // ตรวจสอบรสชาติและกลุ่มสินค้า
                        const flavourMatch = itemBuyList.productFlavour.length === 0 || itemBuyList.productFlavour.includes(listGroup.flavour);
                        const matchingUnit = listGroup.converterUnit.find(unit => unit.unitId === itemBuyList.productUnit[0]);
                        const conditionQtyInUnit = matchingUnit ? matchingUnit.qty : 0;

                        if (flavourMatch) {
                            if (listGroupPromotion.proType === 'free') {
                                if (itemBuyList.productQty === 0 && itemBuyList.productAmount > 0) {
                                    let totalAmountInGroup = 0;
                                    for (const group of listProductGroup) {
                                        if (group.group === listGroup.group && group.size === listGroup.size) {
                                            totalAmountInGroup += group.amount;
                                        }
                                    }

                                    if (totalAmountInGroup >= itemBuyList.productAmount && !appliedPromotions.has(promotionKey)) {
                                        const rewards = await Promise.all(listGroupPromotion.rewards.map(async (reward) => {
                                            const dataRewardItem = await fetchProductDetails(reward);
                                            return {
                                                productId: reward.productGroup,
                                                qty: calculateRewardQty(totalAmountInGroup, itemBuyList.productAmount, reward.productQty),
                                                unitQty: await getUnitName(reward.productUnit),
                                                listProductReward: dataRewardItem
                                            };
                                        }));

                                        PromotionGroupMatch.push({
                                            group: listGroup.group,
                                            size: listGroup.size,
                                            proId: listGroupPromotion.proId,
                                            proCode: listGroupPromotion.proCode,
                                            qtyReward: _.sumBy(rewards, 'qty'),
                                            qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                            listProductReward: rewards.flatMap(r => r.listProductReward),
                                            listProduct: listGroup.listProduct
                                        });

                                        appliedPromotions.add(promotionKey);
                                    }
                                } else if (conditionQtyInUnit >= itemBuyList.productQty) {
                                    const rewards = await Promise.all(listGroupPromotion.rewards.map(async (reward) => {
                                        const dataRewardItem = await fetchProductDetails(reward);
                                        return {
                                            productId: reward.productGroup,
                                            qty: await calPromotion(conditionQtyInUnit, itemBuyList.productQty, reward.productQty),
                                            unitQty: await getUnitName(reward.productUnit),
                                            listProductReward: dataRewardItem
                                        };
                                    }));

                                    PromotionGroupMatch.push({
                                        group: listGroup.group,
                                        size: listGroup.size,
                                        proId: listGroupPromotion.proId,
                                        proCode: listGroupPromotion.proCode,
                                        qtyReward: _.sumBy(rewards, 'qty'),
                                        qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                        listProductReward: rewards.flatMap(r => r.listProductReward),
                                        listProduct: listGroup.listProduct
                                    });

                                    appliedPromotions.add(promotionKey);
                                }
                            } else if (listGroupPromotion.proType === 'discount' && conditionQtyInUnit >= itemBuyList.productQty) {
                                const discountTotal = calculateDiscount(conditionQtyInUnit, itemBuyList.productQty, listGroupPromotion.discounts[0].amount);
                                PromotionDiscountMatch.push({
                                    group: listGroup.group,
                                    size: listGroup.size,
                                    proId: listGroupPromotion.proId,
                                    discount: discountTotal,
                                    listProduct: listGroup.listProduct
                                });
                            }
                        }
                    }
                }
            }
        }



        // Process new store promotions
        if (isStoreNew && hasNoOrder) {
            const dataPromotionGroup = await Promotion.find({ proType: 'new' });
            for (const listGroupPromotion of dataPromotionGroup) {
                for (const itemBuyList of listGroupPromotion.conditions) {
                    if (totalAmount >= itemBuyList.productAmount) {
                        const rewards = await Promise.all(listGroupPromotion.rewards.map(async (reward) => {
                            const dataRewardItem = await fetchProductDetails(reward);
                            return {
                                productId: reward.productGroup,
                                qty: calculateRewardQty(totalAmount, itemBuyList.productAmount, reward.productQty),
                                unitQty: await getUnitName(reward.productUnit),
                                listProductReward: dataRewardItem
                            };
                        }));

                        NewStorePromotions.push({
                            proId: listGroupPromotion.proId,
                            proCode: listGroupPromotion.proCode,
                            qtyReward: _.sumBy(rewards, 'qty'),
                            qtyUnit: rewards.map(r => r.unitQty).join(', '),
                            listProductReward: rewards.flatMap(r => r.listProductReward),
                            listProduct: []
                        });

                        appliedPromotions.add(listGroupPromotion.proId);
                    }
                }
            }
        }

        const combinedPromotions = {
            ListProduct: PromotionProductMatch,
            ProductGroup: [],
            NewStore: NewStorePromotions,
            Discount: PromotionDiscountMatch
        };

        const groupByProId = _.groupBy(PromotionGroupMatch, 'proId');
        for (const proId in groupByProId) {
            const groupPromotions = groupByProId[proId];
            const firstGroup = groupPromotions[0];

            const combinedGroupPromotion = {
                group: firstGroup.group,
                size: firstGroup.size,
                proId: firstGroup.proId,
                proCode: firstGroup.proCode,
                qtyReward: _.sumBy(groupPromotions, 'qtyReward'),
                qtyUnit: firstGroup.qtyUnit,
                listProductReward: _.flatMap(groupPromotions, 'listProductReward'),
                listProduct: firstGroup.listProduct
            };

            combinedPromotions.ProductGroup.push(combinedGroupPromotion);
        }

        await createLog('200', req.method, req.originalUrl, res.body, 'getCompare successfully');
        res.status(200).json(combinedPromotions);
    } catch (error) {
        console.log(error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

comparePromotion.post('/summaryCompare', async (req, res) => {
    try {
        await RewardSummary.deleteOne(req.body);
        const response = await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/compare`, req.body);
        const data = response.data;
        const freeItem = [];
        const discountItem = [];

        // Process free items from ProductGroup
        for (const list of data.ProductGroup) {
            const uniqListProduct = _.uniqBy(list.listProduct, 'id');
            let matchedProduct = {};

            for (const product of uniqListProduct) {
                const foundInReward = list.listProductReward.find(reward => reward.id === product.id);
                if (foundInReward) {
                    matchedProduct = product;
                    break;
                }
            }

            if (_.isEmpty(matchedProduct)) {
                matchedProduct = _.sample(list.listProductReward) || {};
            }

            const dataPro = await Promotion.findOne({ proId: list.proId });
            const unitThai = await Unit.findOne({ nameEng: list.qtyUnit });

            freeItem.push({
                productId: matchedProduct.id || '',
                productName: slicePackSize(matchedProduct.name || ''),
                qty: list.qtyReward,
                qtyText: `${list.qtyReward} ${(unitThai ? unitThai.nameThai : '')}`,
                unitQty: unitThai ? unitThai.idUnit : '',
                unitQtyThai: unitThai ? unitThai.nameThai : '',
                proId: list.proId,
                proCode: dataPro.proCode,
                proName: dataPro ? dataPro.name : '',
                proType: dataPro ? dataPro.proType : ''
            });
        }

        // Process discount items
        for (const list of data.Discount) {
            const dataPro = await Promotion.findOne({ proId: list.proId });
            if (list.listProduct && list.listProduct.length > 0) {
                list.listProduct.forEach(product => {
                    discountItem.push({
                        productId: product.id,
                        productName: product.name,
                        proId: list.proId,
                        proName: dataPro ? dataPro.name : '',
                        discount: dataPro ? dataPro.discounts[0].amount : 0,
                        totalDiscount: parseFloat(list.discount.toFixed(2)),
                    });
                });
            }
        }

        // Process free items from NewStore promotions
        if (data.NewStore && data.NewStore.length > 0) {
            for (const list of data.NewStore) {
                const uniqListProduct = _.uniqBy(list.listProductReward, 'id');
                let matchedProduct = {};

                for (const product of uniqListProduct) {
                    const foundInReward = list.listProductReward.find(reward => reward.id === product.id);
                    if (foundInReward) {
                        matchedProduct = product;
                        break;
                    }
                }

                if (_.isEmpty(matchedProduct)) {
                    matchedProduct = _.sample(list.listProductReward) || {};
                }

                const dataPro = await Promotion.findOne({ proId: list.proId });
                const unitThai = await Unit.findOne({ nameEng: list.qtyUnit });

                freeItem.push({
                    productId: matchedProduct.id || '',
                    productName: slicePackSize(matchedProduct.name || ''),
                    qty: list.qtyReward,
                    qtyText: `${list.qtyReward} ${(unitThai ? unitThai.nameThai : '')}`,
                    unitQty: unitThai ? unitThai.idUnit : '',
                    unitQtyThai: unitThai ? unitThai.nameThai : '',
                    proId: list.proId,
                    proCode: dataPro.proCode,
                    proName: dataPro ? dataPro.name : ''
                });
            }
        }

        const combinedProducts = {};
        freeItem.forEach(product => {
            const { proId, proCode, proName, qty, qtyText, ...rest } = product;
            if (!combinedProducts[proId]) {
                rest.proCode = proCode;
                rest.qty = qty;
                rest.qtyText = qtyText;
                combinedProducts[proId] = { summaryQty: qty, products: [rest], proName, proCode };
            } else {
                rest.proCode = proCode;
                combinedProducts[proId].summaryQty += qty;
                rest.qty = qty;
                rest.qtyText = qtyText;
                combinedProducts[proId].products.push(rest);
            }
        });

        const resultArray = Object.keys(combinedProducts).map(proId => ({
            proId,
            proCode: combinedProducts[proId].proCode,
            proName: combinedProducts[proId].proName,
            summaryQty: combinedProducts[proId].summaryQty,
            listProduct: combinedProducts[proId].products,
        }));

        const saveData = {
            area: req.body.area,
            storeId: req.body.storeId,
            listPromotion: resultArray
        };

        await RewardSummary.create(saveData);
        const queryData = await RewardSummary.findOne(req.body, { _id: 0, 'listPromotion._id': 0, 'listPromotion.listProduct._id': 0 });
        const listFree = queryData.listPromotion;
        await createLog('200', req.method, req.originalUrl, res.body, 'getSummary Compare Successfully');

        res.status(200).json({ area: req.body.area, storeId: req.body.storeId, listFree, listDiscount: discountItem });
    } catch (error) {
        console.log(error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

module.exports = comparePromotion