const express = require('express');
require('../../configs/connect');
const { Promotion, RewardSummary } = require("../../models/promotion");
const { Unit, Product } = require("../../models/product");
const _ = require("lodash");
const { calPromotion, slicePackSize } = require("../../utils/utility");
const { createLog } = require("../../services/errorLog");
const axios = require("axios");
const { log } = require('winston');
const comparePromotion = express.Router();

const getPromotionData = async (listGroup) => {
    try {
        return await Promotion.find({ 'conditions': { $elemMatch: { productId: listGroup.id } } });
    } catch (error) {
        console.error('Error fetching promotion data:', error);
        return [];
    }
};

const getUnitAndProductDetail = async (listRewardData) => {
    try {
        const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit });
        const productDetail = await Product.findOne({ id: listRewardData.productId });
        return {
            unitQty: dataUnitName1 ? dataUnitName1.nameEng : '',
            productName: productDetail ? productDetail.name : ''
        };
    } catch (error) {
        console.error('Error fetching unit and product details:', error);
        return {
            unitQty: '',
            productName: ''
        };
    }
};

const handleFreePromotion = async (listDataPromotion, itemList, listGroup, totalAmount) => {
    const PromotionProductMatch = [];
    if (listDataPromotion.proType === 'free' && itemList.productQty === 0 && itemList.productAmount > 0) {
        if (totalAmount >= itemList.productAmount) {
            try {
                const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId });
                const ttReward = await Promise.all(rewardData.rewards.map(async (listRewardData) => {
                    const detail = await getUnitAndProductDetail(listRewardData);
                    return {
                        productId: listRewardData.productId,
                        productName: detail.productName,
                        qty: listRewardData.productQty,
                        unitQty: detail.unitQty
                    };
                }));
                const data_obj = {
                    productId: listGroup.id,
                    proId: listDataPromotion.proId,
                    TotalPurchasedQuantity: {
                        productId: listGroup.id,
                        qty: listGroup.qtyPurc,
                        nameQty: listGroup.qtyUnitName
                    },
                    TotalReward: ttReward
                };
                PromotionProductMatch.push(data_obj);
            } catch (error) {
                console.error('Error handling free promotion:', error);
            }
        }
    }
    return PromotionProductMatch;
};

const handleDiscountPromotion = async (listDataPromotion, itemList, listGroup) => {
    const PromotionDiscountMatch = [];
    if (itemList.productUnit === listGroup.qtyUnitId) {
        if (listGroup.qtyPurc >= itemList.productQty) {
            if (listDataPromotion.proType === 'discount') {
                const discountPerUnit = listDataPromotion.discounts[0].amount;
                const discountTotal = Math.floor(listGroup.qtyPurc / itemList.productQty) * discountPerUnit;
                const data_obj = {
                    productId: listGroup.id,
                    proId: listDataPromotion.proId,
                    discount: discountTotal,
                    TotalPurchasedQuantity: {
                        productId: listGroup.id,
                        qty: listGroup.qtyPurc,
                        nameQty: listGroup.qtyUnitName
                    }
                };
                PromotionDiscountMatch.push(data_obj);
            }
        }
    }
    return PromotionDiscountMatch;
};

const handleNewPromotion = async (listDataPromotion, itemList, listGroup, totalAmount, area) => {
    const PromotionProductMatch = [];
    try {
        const { data: stores } = await axios.post(process.env.API_URL_IN_USE + '/cms/store/getStoreNew', { area });
        for (const store of stores) {
            if (store) {
                const response = await axios.post(process.env.API_URL_IN_USE + '/cms/order/getOrderCustomer', { customer: store.idStore });
                if (response.status === 204) {
                    if (listDataPromotion.proType === 'free' && itemList.productQty === 0 && itemList.productAmount > 0) {
                        if (totalAmount >= itemList.productAmount) {
                            const rewardData = await Promotion.findOne({ proId: listDataPromotion.proId });
                            const ttReward = await Promise.all(rewardData.rewards.map(async (listRewardData) => {
                                const detail = await getUnitAndProductDetail(listRewardData);
                                return {
                                    productId: listRewardData.productId,
                                    productName: detail.productName,
                                    qty: listRewardData.productQty,
                                    unitQty: detail.unitQty
                                };
                            }));
                            const data_obj = {
                                productId: listGroup.id,
                                proId: listDataPromotion.proId,
                                TotalPurchasedQuantity: {
                                    productId: listGroup.id,
                                    qty: listGroup.qtyPurc,
                                    nameQty: listGroup.qtyUnitName
                                },
                                TotalReward: ttReward
                            };
                            PromotionProductMatch.push(data_obj);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error handling new promotion:', error);
    }
    return PromotionProductMatch;
};

const combinePromotions = (PromotionProductMatch, PromotionGroupMatch, PromotionDiscountMatch) => {
    const combinedPromotions = {
        ListProduct: PromotionProductMatch,
        ProductGroup: [],
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
            qtyReward: _.sumBy(groupPromotions, 'qtyReward'),
            qtyUnit: firstGroup.qtyUnit,
            listProductReward: _.flatMap(groupPromotions, 'listProductReward'),
            listProduct: firstGroup.listProduct
        };

        combinedPromotions.ProductGroup.push(combinedGroupPromotion);
    }

    return combinedPromotions;
};

const handlePromotionGroupMatch = async (dataPromotionGroup, listGroup, totalAmount, area) => {
    const PromotionGroupMatch = [];
    for (const listGroupPromotion of dataPromotionGroup) {
        for (const itemBuyList of listGroupPromotion.conditions) {
            let isMatch = true;

            if (itemBuyList.productGroup.length > 0 && !itemBuyList.productGroup.includes(listGroup.group)) {
                isMatch = false;
            }

            if (itemBuyList.productBrand.length > 0 && !itemBuyList.productBrand.includes(listGroup.brand)) {
                isMatch = false;
            }

            if (itemBuyList.productSize.length > 0 && !itemBuyList.productSize.includes(listGroup.size)) {
                isMatch = false;
            }

            if (isMatch) {
                if ((listGroupPromotion.proType === 'free' || listGroupPromotion.proType === 'new') && itemBuyList.productQty === 0 && itemBuyList.productAmount > 0) {
                    if (totalAmount >= itemBuyList.productAmount) {
                        try {
                            const rewardDataGroup = await Promotion.findOne({ proId: listGroupPromotion.proId });
                            const rewardQty = Math.floor(totalAmount / itemBuyList.productAmount);
                            const ttRewardGroup = await Promise.all(rewardDataGroup.rewards.map(async (listRewardData) => {
                                const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit });
                                const dataRewardItem = await Product.find({ group: listRewardData.productGroup, size: listRewardData.productSize }, { id: 1, _id: 0, name: 1 });
                                return {
                                    productId: listRewardData.productGroup,
                                    qty: listRewardData.productQty,
                                    unitQty: dataUnitName1 ? dataUnitName1.nameEng : ''
                                };
                            }));
                            const data_obj = {
                                group: listGroup.group,
                                size: listGroup.size,
                                proId: listGroupPromotion.proId,
                                qtyReward: listRewardData.productQty,
                                qtyUnit: dataUnitName1 ? dataUnitName1.nameEng : '',
                                listProductReward: dataRewardItem,
                                listProduct: listGroup.listProduct
                            };
                            PromotionGroupMatch.push(data_obj);
                        } catch (error) {
                            console.error('Error handling promotion group match:', error);
                        }
                    }
                } else {
                    try {
                        const unitDetail = await Unit.findOne({ idUnit: itemBuyList.productUnit });
                        const filterData = _.filter(listGroup.converterUnit, { 'name': unitDetail ? unitDetail.nameEng : '' });
                        if (filterData.length > 0 && filterData[0].qty >= itemBuyList.productQty) {
                            if (listGroupPromotion.proType === 'discount') {
                                const discountPerUnit = listGroupPromotion.discounts[0].amount;
                                const discountTotal = Math.floor(filterData[0].qty / itemBuyList.productQty) * discountPerUnit;
                                PromotionGroupMatch.push({
                                    group: listGroup.group,
                                    size: listGroup.size,
                                    proId: listGroupPromotion.proId,
                                    discount: discountTotal
                                });
                            } else if (listGroupPromotion.proType === 'free' || listGroupPromotion.proType === 'new') {
                                const rewardDataGroup = await Promotion.findOne({ proId: listGroupPromotion.proId });
                                const ttRewardGroup = await Promise.all(rewardDataGroup.rewards.map(async (listRewardData) => {
                                    const dataUnitName1 = await Unit.findOne({ idUnit: listRewardData.productUnit });
                                    const dataRewardItem = await Product.find({ group: listRewardData.productGroup, size: listRewardData.productSize }, { id: 1, _id: 0, name: 1 });
                                    return {
                                        productId: listRewardData.productGroup,
                                        qty: await calPromotion(filterData[0].qty, itemBuyList.productQty, listRewardData.productQty),
                                        unitQty: dataUnitName1 ? dataUnitName1.nameEng : ''
                                    };
                                }));
                                const data_obj = {
                                    group: listGroup.group,
                                    size: listGroup.size,
                                    proId: listGroupPromotion.proId,
                                    qtyReward: await calPromotion(filterData[0].qty, itemBuyList.productQty, listRewardData.productQty),
                                    qtyUnit: dataUnitName1 ? dataUnitName1.nameEng : '',
                                    listProductReward: dataRewardItem,
                                    listProduct: listGroup.listProduct
                                };
                                PromotionGroupMatch.push(data_obj);
                            }
                        }
                    } catch (error) {
                        console.error('Error handling promotion group match:', error);
                    }
                }
            }
        }
    }

    return PromotionGroupMatch;
};

comparePromotion.post('/compare', async (req, res) => {
    try {
        const PromotionProductMatch = [];
        const PromotionGroupMatch = [];
        const PromotionDiscountMatch = [];
        const PromotionNewMatch = [];

        const dataSummary = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/getSummaryCart', {
            area: req.body.area,
            storeId: req.body.storeId
        });

        const totalAmount = dataSummary.data.list.totalAmount;

        for (const listGroup of dataSummary.data.list.listProduct) {
            const dataPromotion = await getPromotionData(listGroup);
            if (dataPromotion && dataPromotion.length > 0) {
                for (const listDataPromotion of dataPromotion) {
                    for (const itemList of listDataPromotion.conditions) {
                        const freePromotionMatch = await handleFreePromotion(listDataPromotion, itemList, listGroup, totalAmount);
                        PromotionProductMatch.push(...freePromotionMatch);

                        const discountPromotionMatch = await handleDiscountPromotion(listDataPromotion, itemList, listGroup);
                        PromotionDiscountMatch.push(...discountPromotionMatch);

                        const newPromotionMatch = await handleNewPromotion(listDataPromotion, itemList, listGroup, totalAmount, req.body.area);
                        PromotionNewMatch.push(...newPromotionMatch);
                    }
                }
            }
        }

        for (const listGroup of dataSummary.data.list.listProductGroup) {
            const dataPromotionGroup = await Promotion.find({
                'conditions': {
                    $elemMatch: {
                        $or: [
                            { productGroup: listGroup.group },
                            { productBrand: listGroup.brand },
                            { productSize: listGroup.size }
                        ]
                    }
                }
            });

            const groupPromotionMatch = await handlePromotionGroupMatch(dataPromotionGroup, listGroup, totalAmount, req.body.area);
            PromotionGroupMatch.push(...groupPromotionMatch);
        }

        const combinedPromotions = combinePromotions(PromotionProductMatch, PromotionGroupMatch, PromotionDiscountMatch);

        await createLog('200', req.method, req.originalUrl, res.body, 'getCompare successfully');
        res.status(200).json(combinedPromotions);
    } catch (error) {
        console.error('Error in /compare route:', error);
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
        const response = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/compare', req.body);
        const data = response.data;
        const freeItem = [];
        const discountItem = [];

        for (const list of data.ListProduct) {
            for (let subList of list.TotalReward) {
                if (subList.productId == list.productId) {
                    subList.proId = list.proId;
                    freeItem.push(subList);
                }
            }
        }

        for (const list of data.ProductGroup) {
            let idProduct = '';
            let nameProduct = '';
            const uniqListProduct = _.uniqBy(list.listProduct, 'id');

            for (const subList of list.listProductReward) {
                const matchedProduct = uniqListProduct.find(memberList => memberList.id === subList.id);
                if (matchedProduct) {
                    idProduct = matchedProduct.id;
                    nameProduct = matchedProduct.name;
                    break;
                }
            }

            if (!idProduct) {
                const randomProduct = _.sample(list.listProductReward);
                idProduct = randomProduct ? randomProduct.id : '';
                nameProduct = randomProduct ? randomProduct.name : '';
            }

            const dataPro = await Promotion.findOne({ proId: list.proId });
            const unitThai = await Unit.findOne({ nameEng: list.qtyUnit });
            freeItem.push({
                productId: idProduct,
                productName: slicePackSize(nameProduct),
                qty: list.qtyReward,
                qtyText: list.qtyReward + ' ' + (unitThai ? unitThai.nameThai : ''),
                unitQty: unitThai ? unitThai.idUnit : '',
                unitQtyThai: unitThai ? unitThai.nameThai : '',
                proId: list.proId,
                proName: dataPro ? dataPro.name : '',
                proType: dataPro ? dataPro.proType : ''
            });
        }

        for (const list of data.Discount) {
            const dataPro = await Promotion.findOne({ proId: list.proId });
            discountItem.push({
                productId: list.productId,
                proId: list.proId,
                proName: dataPro ? dataPro.name : '',
                discount: list.discount,
                TotalPurchasedQuantity: list.TotalPurchasedQuantity
            });
        }

        const combinedProducts = {};
        freeItem.forEach(product => {
            const { proId, proName, qty, qtyText, ...rest } = product;
            if (!combinedProducts[proId]) {
                rest.qty = qty;
                rest.qtyText = qtyText;
                combinedProducts[proId] = { summaryQty: qty, products: [rest], proName };
            } else {
                combinedProducts[proId].summaryQty += qty;
                rest.qty = qty;
                rest.qtyText = qtyText;
                combinedProducts[proId].products.push(rest);
            }
        });

        const resultArray = Object.keys(combinedProducts).map(proId => ({
            proId,
            proName: combinedProducts[proId].proName,
            summaryQty: combinedProducts[proId].summaryQty,
            listProduct: combinedProducts[proId].products
        }));

        const saveData = {
            area: req.body.area,
            storeId: req.body.storeId,
            listPromotion: resultArray
        };

        await RewardSummary.create(saveData);
        const queryData = await RewardSummary.findOne(req.body, { _id: 0, 'listPromotion._id': 0, 'listPromotion.listProduct._id': 0 });
        const listFree = queryData ? queryData.listPromotion : [];
        await createLog('200', req.method, req.originalUrl, res.body, 'getSummary Compare Successfully');

        res.status(200).json({ area: req.body.area, storeId: req.body.storeId, listFree, listDiscount: discountItem });
    } catch (error) {
        console.error('Error in /summaryCompare route:', error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

module.exports = comparePromotion;
