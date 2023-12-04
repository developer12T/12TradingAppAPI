const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {Checkin} = require("../../models/route");
const {CartRefund} = require("../../models/refund");
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
        var totalPrice_bath = 0
        const idMirror = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        let listFound = false
        if (idMirror) {
            if (idMirror.list.length > 0) {
                for (const list of idMirror.list) {
                    if (list.id === req.body.list.id && list.unitId === req.body.list.unitId) {
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

            if (!listFound && idMirror.list.every(item => item.unitId !== req.body.list.unitId)) {
                await Cart.updateOne({
                    area: req.body.area, storeId: req.body.storeId,
                }, {$push: {list: req.body.list}});
            }
            totalPrice_bath = req.body.list.qty * req.body.list.pricePerUnitSale
            var summaryPrice = totalPrice_bath + idMirror.totalPrice
            console.log("summaryPrice :: " + summaryPrice)
            await Cart.updateOne({area: req.body.area, storeId: req.body.storeId}, {$set: {totalPrice: summaryPrice}})
        } else {
            req.body.totalPrice = req.body.list.pricePerUnitSale * req.body.list.qty
            await Cart.create(req.body)
        }
        res.status(200).json({status: 201, message: 'Added/Update Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500, message: error.message
        })
    }
})

addCart.delete('/deleteItemCart', async (req, res) => {
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
            status: 200, message: 'Item deleted successfully'
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500, message: e.message
        })
    }
})


module.exports = addCart