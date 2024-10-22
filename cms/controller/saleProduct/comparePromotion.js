const express = require('express')
require('../../configs/connect')
const { Promotion, RewardSummary } = require('../../models/promotion')
const { Order } = require('../../models/order')
const { Unit, Product } = require('../../models/product')
const _ = require('lodash')
const { calPromotion, slicePackSize } = require('../../utils/utility')
const { createLog } = require('../../services/errorLog')
const axios = require('axios')
const { log } = require('winston')
const { restart } = require('nodemon')
const comparePromotion = express.Router()

const matchConditions = (promotion, listGroup, req, typeStore) => {
    const { conditions, store, typeStore: promoTypeStore, area, except } = promotion
    const { storeId, area: reqArea } = req.body
    const { group, brand, size } = listGroup

    return (store.length === 0 || store.includes(storeId)) &&
        (promoTypeStore.length === 0 || promoTypeStore.includes(typeStore)) &&
        (area.length === 0 || area.includes(reqArea)) &&
        (except.length === 0 || !except.includes(storeId)) &&
        (conditions[0].productGroup.length === 0 || conditions[0].productGroup.includes(group)) &&
        (conditions[0].productBrand.length === 0 || conditions[0].productBrand.includes(brand)) &&
        (conditions[0].productSize.length === 0 || conditions[0].productSize.includes(size))
}

const calculateRewardQty = (totalAmount, productAmount, productQty) => {
    return totalAmount >= productAmount ? Math.floor(totalAmount / productAmount) * productQty : 0
}

const getUnitName = async (unitId) => {
    const unit = await Unit.findOne({ idUnit: unitId })
    return unit ? unit.nameEng : ''
}

const fetchProductDetails = async (reward) => {
    const searchConditions = {
        // "convertFact.unitId": { $ne: '3' },
        ...(reward.productId && { id: reward.productId }),
        ...(reward.productGroup && { group: reward.productGroup }),
        ...(reward.productSize && { size: reward.productSize }),
        ...(reward.productFlavour && { flavour: reward.productFlavour }),
        ...(reward.productBrand && { brand: reward.productBrand }),
    };
    return Product.find(searchConditions, { id: 1, _id: 0, name: 1 })
}

const calculateDiscount = (qty, productQty, discountPerUnit) => {
    return Math.floor(qty / productQty) * discountPerUnit;
}

function combineUnitQuantities(productGroups) {
    const combinedQuantities = {};

    productGroups.forEach(group => {
        group.converterUnit.forEach(unit => {
            if (!combinedQuantities[unit.unitId]) {
                combinedQuantities[unit.unitId] = { ...unit }
            } else {
                combinedQuantities[unit.unitId].qty += unit.qty
            }
        });
    });

    return Object.values(combinedQuantities)
}

// version lean ล่าสุด
comparePromotion.post('/compare', async (req, res) => {
    try {

        await RewardSummary.deleteOne(req.body);

        const [cartData, storeNewResponse, storeBeautyResponse, storeMkResponse, promotionData] = await Promise.all([
            axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/getSummaryCart`, { area: req.body.area, storeId: req.body.storeId }),
            axios.post(`${process.env.API_URL_IN_USE}/cms/store/getStoreNew`, { area: req.body.area }),
            axios.post(`${process.env.API_URL_IN_USE}/cms/store/getStoreBeauty`, { area: req.body.area }),
            axios.post(`${process.env.API_URL_IN_USE}/cms/store/getStoreMk`, { area: req.body.area }),
            Promotion.find({}).lean()
        ]);

        const getPromotion = new Map();
        promotionData.forEach(promo => {
            getPromotion.set(promo.proId, promo);
        });

        const { typeStore, list: { totalAmount, listProduct, listProductGroup } } = cartData.data
        // const isStoreNew = storeNewResponse.data.some(store => store.storeId === req.body.storeId)
        // const isStoreBeauty = storeBeautyResponse.data.some(store => store.storeId === req.body.storeId)
        const isStoreNew = Array.isArray(storeNewResponse.data) && storeNewResponse.data.some(store => store.storeId === req.body.storeId)
        const isStoreBeauty = Array.isArray(storeBeautyResponse.data) && storeBeautyResponse.data.some(store => store.storeId === req.body.storeId)
        const isStoreMk = Array.isArray(storeMkResponse.data) && storeMkResponse.data.some(store => store.storeId === req.body.storeId)

        let hasNoOrder = false;
        if (isStoreNew) {
            const { data } = await axios.post(`${process.env.API_URL_IN_USE}/cms/order/getOrderCustomer`, {
                customer: req.body.storeId
            });
            hasNoOrder = data.status === 204;
        }

        // const promotionData = await Promotion.find({});

        const PromotionProductMatch = [];
        const PromotionGroupMatch = [];
        const PromotionDiscountMatch = [];
        const NewStorePromotions = [];
        const BeautyStorePromotions = [];
        let appliedPromotions = new Set();

        for (const listGroup of listProduct) {
            const relevantPromotions = promotionData.filter(promo =>
                promo.conditions.some(cond => cond.productId === listGroup.id)
            );

            for (const promo of relevantPromotions) {
                for (const itemList of promo.conditions) {
                    if (promo.proType === 'free' && itemList.productQty === 0 && itemList.productAmount > 0) {
                        if (totalAmount >= itemList.productAmount) {
                            const ttReward = [];
                            for (const listRewardData of promo.rewards) {
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
                                proId: promo.proId,
                                proCode: promo.proCode,
                                TotalPurchasedQuantity: {
                                    productId: listGroup.id,
                                    qty: listGroup.qtyPurc,
                                    nameQty: listGroup.qtyUnitName
                                },
                                TotalReward: ttReward
                            });
                        }
                    } else if (itemList.productUnit === listGroup.qtyUnitId && listGroup.qtyPurc >= itemList.productQty) {
                        if (promo.proType === 'discount') {
                            const discountTotal = calculateDiscount(listGroup.qtyPurc, itemList.productQty, promo.discounts[0].amount);
                            PromotionDiscountMatch.push({
                                productId: listGroup.id,
                                proId: promo.proId,
                                discount: discountTotal
                            });
                        } else if (promo.proType === 'free') {
                            const ttReward = [];
                            for (const listRewardData of promo.rewards) {
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
                                proId: promo.proId,
                                proCode: promo.proCode,
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
                                if (promo.proType === 'discount') {
                                    const discountTotal = calculateDiscount(convertedQty, itemList.productQty, promo.discounts[0].amount);
                                    PromotionDiscountMatch.push({
                                        productId: listGroup.id,
                                        proId: promo.proId,
                                        discount: discountTotal
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        for (const listGroup of listProductGroup) {
            for (const promo of promotionData) {
                if (await matchConditions(promo, listGroup, req, typeStore)) {
                    for (const itemBuyList of promo.conditions) {
                        // console.log(listGroup)
                        const keyPro = `${promo.proId}`

                        const groupMatch = itemBuyList.productGroup.length === 0 || itemBuyList.productGroup.includes(listGroup.group)
                        const brandMatch = itemBuyList.productBrand.length === 0 || itemBuyList.productBrand.includes(listGroup.brand)
                        const flavourMatch = itemBuyList.productFlavour.length === 0 || listGroup.listProduct.some(product => itemBuyList.productFlavour.includes(product.flavour))
                        const matchingUnit = listGroup.converterUnit.find(unit => unit.unitId === itemBuyList.productUnit[0])
                        const conditionQtyInUnit = matchingUnit ? matchingUnit.qty : 0

                        if (promo.proType === 'amount') {
                            if (totalAmount >= itemBuyList.productAmount && !appliedPromotions.has(keyPro)) {
                                const rewards = await Promise.all(promo.rewards.map(async (reward) => {
                                    const dataRewardItem = await fetchProductDetails(reward);
                                    return {
                                        productId: reward.productGroup,
                                        qty: calculateRewardQty(totalAmount, itemBuyList.productAmount, reward.productQty),
                                        unitQty: await getUnitName(reward.productUnit),
                                        listProductReward: dataRewardItem
                                    };
                                }));

                                PromotionGroupMatch.push({
                                    group: listGroup.group,
                                    size: listGroup.size,
                                    proId: promo.proId,
                                    proCode: promo.proCode,
                                    qtyReward: _.sumBy(rewards, 'qty'),
                                    qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                    listProductReward: [rewards[0].listProductReward[0]],
                                    listProduct: listGroup.listProduct
                                });

                                appliedPromotions.add(keyPro);
                            }
                        } else if (itemBuyList.productFlavour.length > 0) {
                            for (const product of listGroup.listProduct) {
                                if (itemBuyList.productFlavour.includes(product.flavour)) {
                                    const productDetails = await Product.findOne({ id: product.id });
                                    if (productDetails) {
                                        const matchingConvertFact = productDetails.convertFact.find(fact => fact.unitId === itemBuyList.productUnit[0]);
                                        if (matchingConvertFact) {
                                            const flavourConditionQtyInUnit = product.qtyPerFlavour / matchingConvertFact.factor;
                                            if (flavourConditionQtyInUnit >= itemBuyList.productQty) {
                                                const rewards = await Promise.all(promo.rewards.map(async (reward) => {
                                                    const dataRewardItem = await fetchProductDetails(reward);
                                                    return {
                                                        productId: reward.productGroup,
                                                        qty: await calPromotion(flavourConditionQtyInUnit, itemBuyList.productQty, reward.productQty),
                                                        unitQty: await getUnitName(reward.productUnit),
                                                        listProductReward: dataRewardItem
                                                    };
                                                }));

                                                PromotionGroupMatch.push({
                                                    group: listGroup.group,
                                                    size: listGroup.size,
                                                    proId: promo.proId,
                                                    proCode: promo.proCode,
                                                    qtyReward: _.sumBy(rewards, 'qty'),
                                                    qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                                    listProductReward: [rewards[0].listProductReward[0]],
                                                    listProduct: listGroup.listProduct
                                                });

                                                appliedPromotions.add(keyPro);
                                            }
                                        }
                                    }
                                }
                            }

                        } else {
                            if (promo.proType === 'free') {
                                if (itemBuyList.productQty === 0 && itemBuyList.productAmount > 0) {
                                    let totalAmountInGroup = 0;

                                    for (const listGroup of listProductGroup) {
                                        const groupMatch = itemBuyList.productGroup.length === 0 || itemBuyList.productGroup.includes(listGroup.group);
                                        const brandMatch = itemBuyList.productBrand.length === 0 || itemBuyList.productBrand.includes(listGroup.brand);

                                        if (groupMatch && brandMatch) {
                                            totalAmountInGroup += listGroup.totalAmount;
                                        }
                                    }

                                    if (totalAmountInGroup >= itemBuyList.productAmount && !appliedPromotions.has(keyPro)) {
                                        const rewards = await Promise.all(promo.rewards.map(async (reward) => {
                                            const dataRewardItem = await fetchProductDetails(reward)
                                            // console.log(dataRewardItem)
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
                                            proId: promo.proId,
                                            proCode: promo.proCode,
                                            qtyReward: _.sumBy(rewards, 'qty'),
                                            qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                            listProductReward: [rewards[0].listProductReward[0]],
                                            listProduct: listGroup.listProduct
                                        });

                                        appliedPromotions.add(keyPro);
                                    }
                                    // } else if (conditionQtyInUnit >= itemBuyList.productQty) {
                                    //     const rewards = await Promise.all(promo.rewards.map(async (reward) => {
                                    //         const dataRewardItem = await fetchProductDetails(reward);
                                    //         console.log('1', conditionQtyInUnit)
                                    //         console.log('2', itemBuyList.productQty)
                                    //         console.log('3', reward.productQty)
                                    //         return {
                                    //             productId: reward.productGroup,
                                    //             qty: await calPromotion(conditionQtyInUnit, itemBuyList.productQty, reward.productQty),
                                    //             unitQty: await getUnitName(reward.productUnit),
                                    //             listProductReward: dataRewardItem
                                    //         };
                                    //     }));

                                    //     PromotionGroupMatch.push({
                                    //         group: listGroup.group,
                                    //         size: listGroup.size,
                                    //         proId: promo.proId,
                                    //         proCode: promo.proCode,
                                    //         qtyReward: _.sumBy(rewards, 'qty'),
                                    //         qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                    //         listProductReward: [rewards[0].listProductReward[0]],
                                    //         listProduct: listGroup.listProduct
                                    //     });
                                    // }
                                } else if (promo.proType === 'free' && itemBuyList.productQty > 0) {
                                    let totalQtyMatchingConditions = 0;

                                    listProductGroup.forEach(listGroup => {
                                        const groupMatch = itemBuyList.productGroup.length === 0 || itemBuyList.productGroup.includes(listGroup.group);
                                        const brandMatch = itemBuyList.productBrand.length === 0 || itemBuyList.productBrand.includes(listGroup.brand);
                                        const sizeMatch = itemBuyList.productSize.length === 0 || itemBuyList.productSize.includes(listGroup.size);

                                        if (groupMatch && brandMatch && sizeMatch) {
                                            const matchingUnit = listGroup.converterUnit.find(unit => unit.unitId === itemBuyList.productUnit[0]);
                                            if (matchingUnit) {
                                                totalQtyMatchingConditions += matchingUnit.qty;
                                            }
                                        }
                                    });

                                    if (totalQtyMatchingConditions >= itemBuyList.productQty && !appliedPromotions.has(keyPro)) {
                                        const rewards = await Promise.all(promo.rewards.map(async (reward) => {
                                            const dataRewardItem = await fetchProductDetails(reward);
                                            return {
                                                productId: reward.productGroup,
                                                qty: await calPromotion(totalQtyMatchingConditions, itemBuyList.productQty, reward.productQty),
                                                unitQty: await getUnitName(reward.productUnit),
                                                listProductReward: dataRewardItem
                                            };
                                        }));

                                        PromotionGroupMatch.push({
                                            group: listGroup.group,
                                            size: listGroup.size,
                                            proId: promo.proId,
                                            proCode: promo.proCode,
                                            qtyReward: _.sumBy(rewards, 'qty'),
                                            qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                            listProductReward: [rewards[0].listProductReward[0]],
                                            listProduct: listGroup.listProduct
                                        });
                                        appliedPromotions.add(keyPro);
                                    }
                                }

                            } else if (promo.proType === 'discount' && conditionQtyInUnit >= itemBuyList.productQty) {
                                const discountTotal = calculateDiscount(conditionQtyInUnit, itemBuyList.productQty, promo.discounts[0].amount);
                                PromotionDiscountMatch.push({
                                    group: listGroup.group,
                                    size: listGroup.size,
                                    proId: promo.proId,
                                    discount: discountTotal,
                                    listProduct: listGroup.listProduct
                                });
                            }
                        }
                    }
                }
            }
        }

        if (isStoreNew && hasNoOrder) {
            for (const promo of promotionData.filter(p => p.proType === 'new')) {
                for (const itemBuyList of promo.conditions) {
                    if (totalAmount >= itemBuyList.productAmount) {
                        const rewards = await Promise.all(promo.rewards.map(async (reward) => {
                            const dataRewardItem = await fetchProductDetails(reward);
                            return {
                                productId: reward.productGroup,
                                qty: calculateRewardQty(totalAmount, itemBuyList.productAmount, reward.productQty),
                                unitQty: await getUnitName(reward.productUnit),
                                listProductReward: dataRewardItem
                            };
                        }));

                        NewStorePromotions.push({
                            group: promo.rewards[0].productGroup,
                            size: promo.rewards[0].productSize,
                            proId: promo.proId,
                            proCode: promo.proCode,
                            qtyReward: _.sumBy(rewards, 'qty'),
                            qtyUnit: rewards.map(r => r.unitQty).join(', '),
                            listProductReward: [rewards[0].listProductReward[0]],
                        });

                        appliedPromotions.add(promo.proId);
                    }
                }
            }
        }

        if (isStoreBeauty) {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const orderExists = await Order.aggregate([
                { $match: { storeId: req.body.storeId, status: { $ne: '90' }, 'list.proCode': 'BT01' } },
                { $addFields: { createdDateConverted: { $toDate: "$createDate" } } },
                { $match: { $expr: { $and: [{ $eq: [{ $month: "$createdDateConverted" }, currentMonth] }, { $eq: [{ $year: "$createdDateConverted" }, currentYear] }] } } }
            ]);

            if (!orderExists.length) {
                for (const promo of promotionData.filter(p => p.proType === 'beauty')) {
                    for (const itemBuyList of promo.conditions) {
                        if (totalAmount >= itemBuyList.productAmount) {
                            const rewards = await Promise.all(promo.rewards.map(async (reward) => {
                                const dataRewardItem = await fetchProductDetails(reward);
                                return {
                                    productId: reward.productGroup,
                                    qty: reward.productQty,
                                    unitQty: await getUnitName(reward.productUnit),
                                    listProductReward: dataRewardItem
                                }
                            }))
                            BeautyStorePromotions.push({
                                group: promo.rewards[0].productGroup,
                                size: promo.rewards[0].productSize,
                                proId: promo.proId,
                                proCode: promo.proCode,
                                qtyReward: _.sumBy(rewards, 'qty'),
                                qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                listProductReward: [rewards[0].listProductReward[0]],
                            });
                            appliedPromotions.add(promo.proId)
                        }
                    }
                }
            }
        }

        if (isStoreMk) {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const orderExists = await Order.aggregate([
                { $match: { storeId: req.body.storeId, status: { $ne: '90' }, 'list.proCode': 'MK01' } },
                { $addFields: { createdDateConverted: { $toDate: "$createDate" } } },
                { $match: { $expr: { $and: [{ $eq: [{ $month: "$createdDateConverted" }, currentMonth] }, { $eq: [{ $year: "$createdDateConverted" }, currentYear] }] } } }
            ]);

            if (!orderExists.length) {
                for (const promo of promotionData.filter(p => p.proType === 'marketing')) {
                    for (const itemBuyList of promo.conditions) {
                        if (totalAmount >= itemBuyList.productAmount) {
                            const rewards = await Promise.all(promo.rewards.map(async (reward) => {
                                const dataRewardItem = await fetchProductDetails(reward);
                                return {
                                    productId: reward.productGroup,
                                    qty: reward.productQty,
                                    unitQty: await getUnitName(reward.productUnit),
                                    listProductReward: dataRewardItem
                                }
                            }))
                            BeautyStorePromotions.push({
                                group: promo.rewards[0].productGroup,
                                size: promo.rewards[0].productSize,
                                proId: promo.proId,
                                proCode: promo.proCode,
                                qtyReward: _.sumBy(rewards, 'qty'),
                                qtyUnit: rewards.map(r => r.unitQty).join(', '),
                                listProductReward: [rewards[0].listProductReward[0]],
                            });
                            appliedPromotions.add(promo.proId)
                        }
                    }
                }
            }
        }

        const freeItem = [];
        const discountItem = [];

        for (const list of [...PromotionGroupMatch, ...NewStorePromotions, ...BeautyStorePromotions]) {
            const uniqListProduct = _.uniqBy(list.listProduct, 'id')
            let matchedProduct = {}

            for (const product of uniqListProduct) {
                const foundInReward = list.listProductReward.find(reward => reward.id === product.id)
                if (foundInReward) {
                    matchedProduct = product
                    break
                }
            }

            if (_.isEmpty(matchedProduct)) {
                matchedProduct = _.sample(list.listProductReward) || {};
            }

            // const dataPro = await Promotion.findOne({ proId: list.proId });
            const dataPro = getPromotion.get(list.proId);
            const unitThai = await Unit.findOne({ nameEng: list.qtyUnit });

            freeItem.push({
                productId: matchedProduct.id,
                productName: slicePackSize(matchedProduct.name),
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

        for (const list of PromotionDiscountMatch) {
            const dataPro = await Promotion.findOne({ proId: list.proId })
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

        const combinedProducts = {};
        freeItem.forEach(product => {
            const { productId, proId, proCode, proName, qty, unitQty, unitQtyThai, proType, productName } = product

            if (!combinedProducts[proId]) {
                combinedProducts[proId] = {
                    proId: proId,
                    summaryQty: qty,
                    unitQty,
                    listProduct: [{
                        productId,
                        productName,
                        qty,
                        unitQty,
                        unitQtyThai,
                        proType,
                        proCode,
                        qtyText: `${qty} ${unitQtyThai}`
                    }],
                    proName,
                    proCode
                }
            } else {
                combinedProducts[proId].summaryQty += qty

                const existingProduct = combinedProducts[proId].listProduct.find(p => p.productName === productName && p.unitQty === unitQty)

                if (existingProduct) {
                    existingProduct.qty += qty;
                    existingProduct.qtyText = `${existingProduct.qty} ${unitQtyThai}`
                } else {
                    combinedProducts[proId].listProduct.push({
                        productId,
                        productName,
                        qty,
                        unitQty,
                        unitQtyThai,
                        proType,
                        proCode,
                        qtyText: `${qty} ${unitQtyThai}`
                    });
                }
            }
        });

        const listPromotion = Object.keys(combinedProducts).map(proId => ({
            proId: combinedProducts[proId].proId,
            proCode: combinedProducts[proId].proCode,
            proName: combinedProducts[proId].proName,
            summaryQty: combinedProducts[proId].summaryQty,
            unitQty: combinedProducts[proId].unitQty,
            listProduct: combinedProducts[proId].listProduct,
        }));

        const saveData = {
            area: req.body.area,
            storeId: req.body.storeId,
            listPromotion,
            listDiscount: discountItem
        };

        await RewardSummary.create(saveData);

        await createLog('200', req.method, req.originalUrl, res.body, 'getCompare successfully')
        // res.status(200).json(saveData)
        res.status(200).json({ message: 'Update Promotion Success' })
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

comparePromotion.post('/summaryCompare', async (req, res) => {
    try {
        let queryData = await RewardSummary.findOne(
            { area: req.body.area, storeId: req.body.storeId },
            { _id: 0, 'listPromotion._id': 0, 'listPromotion.listProduct._id': 0 }
        );

        if (!queryData) {

            await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/compare`, req.body);

            queryData = await RewardSummary.findOne(
                { area: req.body.area, storeId: req.body.storeId },
                { _id: 0, 'listPromotion._id': 0, 'listPromotion.listProduct._id': 0 }
            );
        }

        if (!queryData) {
            return res.status(404).json({
                status: 404,
                message: "No summary data found for the given area and storeId."
            });
        }
        const freeItem = [];
        const discountItem = [];

        for (const list of queryData.listPromotion) {
            const unitThai = await Unit.findOne({ idUnit: list.unitQty });
            for (const product of list.listProduct) {
                freeItem.push({
                    proId: list.proId,
                    proCode: list.proCode,
                    proName: list.proName,
                    summaryQty: list.summaryQty,
                    listProduct: [{
                        productId: product.productId,
                        productName: product.productName,
                        qty: product.qty,
                        unitQty: list.unitQty,
                        unitQtyThai: unitThai ? unitThai.nameThai : '',
                        proType: 'free',
                        proCode: list.proCode,
                        qtyText: `${product.qty} ${unitThai ? unitThai.nameThai : ''}`
                    }]
                });
            }
        }

        for (const list of queryData.listDiscount) {
            discountItem.push({
                productId: list.productId,
                productName: list.productName,
                proId: list.proId,
                proName: list.proName,
                discount: list.discount,
                totalDiscount: list.totalDiscount
            });
        }

        await createLog('200', req.method, req.originalUrl, res.body, 'getSummary Compare Successfully');

        res.status(200).json({
            area: req.body.area,
            storeId: req.body.storeId,
            listFree: freeItem,
            listDiscount: discountItem
        });
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