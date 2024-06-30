 const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {log} = require("winston");
const {createLog} = require("../../services/errorLog");
 const {CartCn} = require("../../models/cnOrder");

const addCart = express.Router()

addCart.post('/addProductToCart', async (req, res) => {
    try {
        const checkStore = await Cart.findOne({ area: req.body.area, storeId: req.body.storeId });
        if (!checkStore) {
            req.body.totalPrice = req.body.list.pricePerUnitSale * req.body.list.qty;
            req.body.shipping = {
                address: '',
                dateShip: '',
                note: ''
            };
            await Cart.create(req.body);
        } else {
            const checkStoreListProduct = await Cart.findOne({ area: req.body.area, storeId: req.body.storeId, 'list.id': req.body.list.id });
            if (!checkStoreListProduct) {
                console.log('ไม่มี product');
                await Cart.updateOne({
                    area: req.body.area, storeId: req.body.storeId,
                }, { $push: { list: req.body.list } });

            } else {
                console.log('พบ product');
                const checkStoreListProductUnit = await Cart.findOne({
                    area: req.body.area,
                    storeId: req.body.storeId,
                    list: {
                        $elemMatch: {
                            id: req.body.list.id,
                            unitId: req.body.list.unitId
                        }
                    }
                }, { 'list.$': 1 });

                if (!checkStoreListProductUnit) {
                    console.log('ไม่พบ unit id ที่เหมือนกัน');
                    await Cart.updateOne({
                        area: req.body.area, storeId: req.body.storeId,
                    }, { $push: { list: req.body.list } });
                } else {
                    console.log('พบ unit id ที่เหมือนกัน', checkStoreListProductUnit);
                    await Cart.updateOne({
                        area: req.body.area,
                        storeId: req.body.storeId,
                        'list.id': req.body.list.id,
                        'list.unitId': req.body.list.unitId
                    }, {
                        $set: {
                            'list.$.qty': checkStoreListProductUnit.list[0].qty + req.body.list.qty,
                        }
                    });
                }
            }
        }

        const updateTotalPrice = await Cart.findOne({ area: req.body.area, storeId: req.body.storeId });
        let summaryTotalAmount = 0;
        for (const listData of updateTotalPrice.list) {
            summaryTotalAmount += (listData.qty * listData.pricePerUnitSale);
        }
        console.log(summaryTotalAmount);
        await Cart.updateOne({
            area: req.body.area,
            storeId: req.body.storeId,
        }, {
            $set: {
                totalPrice: summaryTotalAmount,
            }
        });

        await createLog('200', req.method, req.originalUrl, res.body, 'Added/Update Successfully');
        res.status(200).json({ status: 201, message: 'Added/Update Successfully' });
    } catch (error) {
        console.log(error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500, message: error.message
        });
    }
});

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
        await createLog('200',req.method,req.originalUrl,res.body,'Item Deleteded successfully')
        res.status(200).json({
            status: 200, message: 'Item Deleteded successfully'
        });
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
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
        await createLog('200',req.method,req.originalUrl,res.body,'Update Shipping successfully')
        res.status(200).json({
            status: 201, message: 'Update Shipping successfully'
        });
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500, message: error.message
        })
    }
})

 addCart.post('/updateQtyProduct', async (req, res) => {
         try {
             const {area, storeId, id, qty, unitId} = req.body
             let counter
             // console.log(action)
             if (qty === 0) {
                 await Cart.updateOne({
                     area,
                     storeId,
                     'list.id': id,
                     'list.unitId': unitId
                 }, {
                     $pull: {
                         'list': {
                             id: id,
                             unitId: unitId
                         }
                     }
                 })

             } else if(qty !== 0) {
                 await Cart.updateOne({
                     area, storeId, list: {
                         $elemMatch: {
                             id: id,
                             unitId: unitId
                         }
                     }
                 }, {
                     $set: {
                         'list.$.qty': qty
                     }
                 })

             }else{
                 res.status(200).json({status: '204', message: 'qty has undefined!!'})
             }

             const dataList = await Cart.findOne({
                 area, storeId
             },{
                 "list":1
             })

             let ttPrice = 0
             for (const list of dataList.list){
                 ttPrice = ttPrice + (list.pricePerUnitSale * list.qty)
             }
             await Cart.updateOne({ area, storeId},{
                 totalPrice:ttPrice
             })
             res.status(200).json({status: '200', message: 'update qty successfully'})
         } catch (e) {
             console.log(e)
             await createLog('500', req.method, req.originalUrl, res.body, e.message)
             res.status(500).json({
                 status: 500,
                 message: e.message
             })
         }
 })


module.exports = addCart