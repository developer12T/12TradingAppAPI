const express = require('express')
require('../../../configs/connect')
const {createLog} = require("../../../services/errorLog");
const {errResponse} = require("../../../services/errorResponse");
const {CartCn} = require("../../../models/cnOrder");
const {Cart} = require("../../../models/saleProduct");
const addProductToCnCart = express.Router()
addProductToCnCart.post('/addProductToCart', async (req, res) => {
    try {
        //Declare Variable
        let {area, storeId} = req.body
        let {id, name, pricePerUnitRefund, qty, unitId} = req.body.list
        //find value
        const checkIdCartCn = await CartCn.findOne({area: area, storeId: storeId})
        console.log(checkIdCartCn)
        if (checkIdCartCn === null) {
            let mainData = {
                area,
                storeId,
                totalPrice: pricePerUnitRefund * qty,
                list: [
                    {
                        id,
                        name,
                        pricePerUnitRefund,
                        qty,
                        unitId
                    }
                ],
                shipping: {
                    address: null,
                    dateShip: null,
                    note: null
                }
            }
            await CartCn.create(mainData)
            await createLog('200', req.method, req.originalUrl, res.body, 'Add Product And Create IdCartCn')
            res.status(200).json({
                status: 201,
                message: 'Add Product And Create Id CartCn'
            })
        } else {
            console.log('มีอยู่แล้ว')
            const checkUnitItem = await CartCn.findOne({
                    list: {
                        $elemMatch: {
                            id: id,
                            unitId: unitId
                        }
                    }
                },
                {'list.$': 1})

            // console.log(checkUnitItem.list.length)
            if (checkUnitItem) {
                await CartCn.updateOne({
                    area: req.body.area,
                    storeId: req.body.storeId,
                    list: {
                        $elemMatch: {
                            id: req.body.list.id,
                            unitId: req.body.list.unitId
                        }
                    }
                }, {
                    $set: {
                        'list.$.qty': checkUnitItem.list[0].qty + qty,
                    }
                })
            } else {
                await CartCn.updateOne({
                    area: area, storeId: storeId,
                }, {$push: {list: req.body.list}})
            }

            const updateTotalPrice = await CartCn.findOne({area: area, storeId: storeId})
            // console.log(updateTotalPrice.list)
            let summaryTotalAmount = 0
            for (const listData of updateTotalPrice.list) {
                summaryTotalAmount = summaryTotalAmount + (listData.qty * listData.pricePerUnitRefund)
            }
            console.log(summaryTotalAmount)
            await CartCn.updateOne({
                area: area,
                storeId: storeId,
                'list.id': id,
                'list.unitId': unitId
            }, {
                $set: {
                    totalPrice: summaryTotalAmount,
                }
            })
            res.status(200).json({
                status: 201,
                message: 'Add Product To CartCn',
            })
        }
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

addProductToCnCart.post('/deleteProduct', async (req, res) => {
    try {
        const {area, storeId, idProduct, unitId} = req.body
        await CartCn.updateOne({area: area, storeId: storeId}, {
            $pull: {
                'list': {
                    id: idProduct, unitId: unitId
                }
            }
        })

        const updateTotalPrice = await CartCn.findOne({area: area, storeId: storeId})
        // console.log(updateTotalPrice.list)
        let summaryTotalAmount = 0
        for (const listData of updateTotalPrice.list) {
            summaryTotalAmount = summaryTotalAmount + (listData.qty * listData.pricePerUnitRefund)
        }
        console.log(summaryTotalAmount)
        await CartCn.updateOne({
            area: area,
            storeId: storeId
        }, {
            $set: {
                totalPrice: summaryTotalAmount,
            }
        })

        await createLog('200', req.method, req.originalUrl, res.body, 'deleteProduct In CartCn')
        res.status(200).json({
            status: 201,
            message: 'delete Product In CartCn',
        })
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = addProductToCnCart