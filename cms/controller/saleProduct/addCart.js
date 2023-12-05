const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {log} = require("winston");

const addCart = express.Router()

// addCart.post('/addCart', async (req, res) => {
//     try {
//         var totalPrice_bath = 0
//         const priceData = await Cart.findOne({area: req.body.area, storeId: req.body.storeId}, {totalPrice: 1})
//         if (priceData === null) {
//             for (let i = 0; i < req.body.list.length; i++) {
//                 console.log(req.body.list[i].id)
//                 totalPrice_bath = totalPrice_bath + (req.body.list[i].qty * req.body.list[i].pricePerUnitSale)
//             }
//             console.log(totalPrice_bath)
//             req.body.totalPrice = totalPrice_bath
//             const addCart = new Cart(req.body)
//             await addCart.save()
//             res.status(200).json({status:201,message:'AddCart Successfully'})
//         } else {
//
//             for (let i = 0; i < req.body.list.length; i++) {
//                 console.log(req.body.list[i].id)
//                 totalPrice_bath = totalPrice_bath + (req.body.list[i].qty * req.body.list[i].pricePerUnitSale)
//                 await Cart.updateOne({
//                     area: req.body.area,
//                     storeId: req.body.storeId
//                 }, {$push: {list: req.body.list[i]}})
//             }
//             var summaryPrice = totalPrice_bath + priceData.totalPrice
//             await Cart.updateOne({area: req.body.area, storeId: req.body.storeId}, {$set: {totalPrice: summaryPrice}})
//             res.status(200).json({status:201,message:'update Successfully'})
//         }
//     } catch (e) {
//         console.log(e)
//         res.status(500).json({
//             status: 500,
//             message: e.message
//         })
//     }
// })

addCart.post('/addProductToCart', async (req, res) => {
    try {
/*        var totalPrice_bath = 0
        const idMirror = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        let listFound = false
        if (idMirror) {
            if (idMirror.list.length > 0) {
                for (const list of idMirror.list) {
                    if (list.id === req.body.list.id) {
                        if(list.unitId === req.body.list.unitId){
                            await Cart.updateOne({
                                area: req.body.area,
                                storeId: req.body.storeId,
                                'list.id': req.body.list.id,
                                'list.unitId': req.body.list.unitId
                            }, {
                                $set: {
                                    'list.$.qty': list.qty + req.body.list.qty,
                                }
                            });
                            listFound = true
                            break
                        }
                    }
                }
            }

            if (!listFound && idMirror.list.every(item => item.unitId !== req.body.list.unitId)) {
                await Cart.updateOne({
                    area: req.body.area, storeId: req.body.storeId,
                }, {$push: {list: req.body.list}});
            }

            totalPrice_bath = req.body.list.qty * req.body.list.pricePerUnitSale
            var summaryPrice = totalPrice_bath + idMirror.totalPrice
            // console.log("summaryPrice :: " + summaryPrice)
            await Cart.updateOne({area: req.body.area, storeId: req.body.storeId}, {$set: {totalPrice: summaryPrice}})
        } else {
            req.body.totalPrice = req.body.list.pricePerUnitSale * req.body.list.qty
            await Cart.create(req.body)
        }*/
        const checkStore = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        if(!checkStore){
            req.body.totalPrice = req.body.list.pricePerUnitSale * req.body.list.qty
            await Cart.create(req.body)
        }else{
            const checkStoreListProduct = await Cart.findOne({'list.id':req.body.list.id})
            if(!checkStoreListProduct){
                console.log('ไม่มี product')
                await Cart.updateOne({
                    area: req.body.area, storeId: req.body.storeId,
                }, {$push: {list: req.body.list}})
            }else{
                console.log('พบ product')
                const checkStoreListProduct = await Cart.findOne({'list.unitId':req.body.list.unitId},)
                if(!checkStoreListProduct){
                    console.log('ไม่พบ unit id ที่เหมือนกัน')
                    await Cart.updateOne({
                        area: req.body.area, storeId: req.body.storeId,
                    }, {$push: {list: req.body.list}})
                }else{
                    console.log('พบ unit id ที่เหมือนกัน'+checkStoreListProduct)
                    const checkStoreListProductUnit  = await Cart.findOne(
                        {'list.unitId': req.body.list.unitId},
                        {'list.$': 1} // Projection to select only the matching element in the 'list' array
                    )
                    // console.log(checkStoreListProductUnit.list[0].qty)
                    await Cart.updateOne({
                        area: req.body.area,
                        storeId: req.body.storeId,
                        'list.id': req.body.list.id,
                        'list.unitId': req.body.list.unitId
                    }, {
                        $set: {
                            'list.$.qty': checkStoreListProductUnit.list[0].qty + req.body.list.qty,
                        }
                    })
                }
            }
        }

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

module.exports = addCart