const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {log} = require("winston");

const addCart = express.Router()

addCart.post('/addProductToCart', async (req, res) => {
    try {
        const checkStore = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        if (!checkStore) {
            req.body.totalPrice = req.body.list.pricePerUnitSale * req.body.list.qty
            req.body.shipping = {
                address: '',
                dateShip: '',
                note: ''
            }
            await Cart.create(req.body)
        } else {
            const checkStoreListProduct = await Cart.findOne({'list.id': req.body.list.id})
            if (!checkStoreListProduct) {
                console.log('ไม่มี product')
                await Cart.updateOne({
                    area: req.body.area, storeId: req.body.storeId,
                }, {$push: {list: req.body.list}})

            } else {
                console.log('พบ product')
                const checkStoreListProduct = await Cart.findOne({'list.unitId': req.body.list.unitId},)
                if (!checkStoreListProduct) {
                    console.log('ไม่พบ unit id ที่เหมือนกัน')
                    await Cart.updateOne({
                        area: req.body.area, storeId: req.body.storeId,
                    }, {$push: {list: req.body.list}})
                } else {
                    console.log('พบ unit id ที่เหมือนกัน' + checkStoreListProduct)
                    const checkStoreListProductUnit = await Cart.findOne(
                        {
                            list: {
                                $elemMatch: {
                                    id: req.body.list.id,
                                    unitId: req.body.list.unitId
                                }
                            }
                        },
                        {'list.$': 1} // Projection to select only the matching element in the 'list' array
                    )
                    // console.log(checkStoreListProductUnit.list[0].qty)
                    await Cart.updateOne({
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
                            'list.$.qty': checkStoreListProductUnit.list[0].qty + req.body.list.qty,
                        }
                    })

                }
            }
        }

        const updateTotalPrice = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        // console.log(updateTotalPrice.list)
        let summaryTotalAmount = 0
        for (const listData of updateTotalPrice.list) {
            summaryTotalAmount = summaryTotalAmount + (listData.qty * listData.pricePerUnitSale)
        }
        console.log(summaryTotalAmount)
        await Cart.updateOne({
            area: req.body.area,
            storeId: req.body.storeId,
            'list.id': req.body.list.id,
            'list.unitId': req.body.list.unitId
        }, {
            $set: {
                totalPrice: summaryTotalAmount,
            }
        })
        // res.status(200).json(checkStore)
        res.status(200).json({status: 201, message: 'Added/Update Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500, message: error.message
        })
    }
})

addCart.post('/deleteItemCart', async (req, res) => {
    try {
        const {area, storeId, idProduct, unitId} = req.body;
        await Cart.updateOne({
            area: area, storeId: storeId
        }, {
            $pull: {
                'list': {
                    id: idProduct, unitId: unitId
                }
            }
        })
        res.status(200).json({
            status: 200, message: 'Item Deleteded successfully'
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500, message: error.message
        })
    }
})

addCart.put('/updateShipping', async (req, res) => {
    try {
        const {currentdateDash} = require("../../utils/utility")
        const shipDate = {
            address: req.body.shippingAddress,
            dateShip: req.body.dateShip,
            note: req.body.note
        }
        await Cart.updateOne({
            area: req.body.area, storeId: req.body.storeId
        }, {
            $set: {
                shipping: shipDate
            }
        })
        res.status(200).json({
            status: 201, message: 'Update Shipping successfully'
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500, message: error.message
        })
    }
})


module.exports = addCart