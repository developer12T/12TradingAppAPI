const express = require('express')
require('../../configs/connect')
const { currentdateDash, slicePackSize } = require("../../utils/utility")
const { RewardSummary, Promotion } = require("../../models/promotion")
const axios = require("axios");
const { Product } = require("../../models/product")
const { createLog } = require("../../services/errorLog")

const receiptReward = express.Router()

receiptReward.post('/getChangeRewardSummary', async (req, res) => {
    try {
        const data = await RewardSummary.findOne({
            area: req.body.area, storeId: req.body.storeId,
            listPromotion: {
                $elemMatch: {
                    proId: req.body.proId,
                }
            }
        }, { 'listPromotion.$': 1, area: 1, storeId: 1 });

        let mainData = [];
        let groupObj = [];
        const responseData = await Promotion.findOne({ proId: req.body.proId }, { rewards: 1, name: 1, _id: 0 });

        for (const list of responseData.rewards) {
            if (list.productId === '') {
                if (list.productGroup !== '') {
                    const itemFreeData = await Product.find({
                        group: list.productGroup,
                        size: list.productSize,
                        "convertFact.unitId": { $ne: '3' }
                    }, { id: 1, _id: 0, name: 1 });

                    const slicedItemFreeData = itemFreeData.map(item => ({
                        ...item.toObject(),
                        name: slicePackSize(item.name)
                    }));

                    mainData.push(slicedItemFreeData);
                    groupObj.push({
                        group: list.productGroup,
                        size: list.productSize
                    });
                } else {
                    console.log('empty condition');
                }
            } else {
                const itemFreeDataList = await Product.find({
                    id: list.productId
                }, { id: 1, _id: 0, name: 1 });

                const slicedItemFreeDataList = itemFreeDataList.map(item => ({
                    ...item.toObject(),
                    name: slicePackSize(item.name)
                }));

                mainData.push(slicedItemFreeDataList);
            }
        }

        const resData = {
            area: req.body.area,
            storeId: req.body.storeId,
            proId: req.body.proId,
            proName: responseData.name,
            groupObj,
            listProduct: mainData[0] 
        };

        await createLog('200', req.method, req.originalUrl, res.body, 'getChangeRewardSummary successfully');
        res.status(200).json(resData);
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

receiptReward.post('/updateRewardSummary', async (req, res) => {
    try {
        const { area, storeId, proId, productId, productName, qty, qtyText, unitQty, unitQtyThai, productIdChange } = req.body;

        const dataReward = await RewardSummary.findOne({
            area: area,
            storeId: storeId,
            listPromotion: { $elemMatch: { proId: proId } }
        });

        if (!dataReward) {
            return res.status(404).json({ status: 404, message: 'ไม่พบโปรโมชัน' });
        }

        const promotion = dataReward.listPromotion.find(promo => promo.proId === proId);
        if (!promotion) {
            return res.status(404).json({ status: 404, message: 'ไม่พบโปรโมชัน' });
        }

        const totalQty = promotion.listProduct.reduce((sum, product) => sum + product.qty, 0);

        if (totalQty === promotion.summaryQty) {

            const existingProduct = promotion.listProduct.find(product => product.productId === productId);
            const productToChange = promotion.listProduct.find(product => product.productId === productIdChange);

            if (existingProduct) {
                existingProduct.qty += qty;

                if (productToChange) {
                    productToChange.qty -= qty;

                    if (productToChange.qty <= 0) {
                        promotion.listProduct = promotion.listProduct.filter(product => product.productId !== productIdChange);
                    }
                }
            } else {
                promotion.listProduct.push({
                    productId,
                    productName,
                    qty,
                    qtyText,
                    unitQty,
                    unitQtyThai
                });

                if (productToChange) {
                    productToChange.qty -= qty;

                    if (productToChange.qty <= 0) {
                        promotion.listProduct = promotion.listProduct.filter(product => product.productId !== productIdChange);
                    }
                }
            }

            const updatedTotalQty = promotion.listProduct.reduce((sum, product) => sum + product.qty, 0);

            if (updatedTotalQty > promotion.summaryQty) {
                return res.status(400).json({ status: 400, message: 'จำนวนครบแล้ว' });
            }
        } else {
            return res.status(400).json({ status: 400, message: 'จำนวนครบแล้ว' });
        }

        await dataReward.save();
        await createLog('200', req.method, req.originalUrl, req.body, 'อัปเดตโปรโมชันเรียบร้อย!');
        res.status(200).json({ status: 200, message: 'อัปเดตโปรโมชันเรียบร้อย!', data: dataReward });
    } catch (error) {
        console.error('Error:', error);
        await createLog('500', req.method, req.originalUrl, req.body, error.message);
        res.status(500).json({ status: 500, message: error.message });
    }
});

module.exports = receiptReward