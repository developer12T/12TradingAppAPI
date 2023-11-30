const express = require('express')
require('../../configs/connect')

const {Refund, CartRefund} = require('../../models/refund')
const {NumberSeries} = require("../../models/numberSeries");
const {available, updateAvailable} = require("../../services/numberSeriers");
const { currentdateDash } = require("../../utils/utility");
const {Product} = require("../../models/product");
const refundProduct = express.Router()

refundProduct.post('/newRefund', async (req, res) => {
    try {
        const {available, updateAvailable} = require('../../services/numberSeriers')
        const {currentdateDash} = require("../../utils/utility")

        const idIn = await Refund.findOne({}, {idIndex: 1}).sort({idIndex: -1}).exec()
        const idUniq = await Refund.findOne({}, {id: 1}).sort({id: -1}).exec()

        if (!idIn) {
            var idIndex = 1
        } else {
            var idIndex = idIn.idIndex + 1
        }

        if (!idUniq) {
            var idUnq = currentdateDash().substring(2, 4) + 1
        } else {
            var idUnq = idUniq.id + 1
        }

        const idChange = await available(req.body.numberSeries.type, req.body.numberSeries.zone)
        const idRepair = await available('orderRefund', 'MBE')

        const datalListReturn = []
        const datalListChange = []

        for (const list of req.body.listReturn) {
            const dataProduct = await Product.findOne({id: list.id})

            if (dataProduct) {
                const unitsWithIdOne = dataProduct.unitList.filter(unit => unit.id === list.unit);

                if (unitsWithIdOne.length > 0) {

                    const mainData = {
                        id: dataProduct.id,
                        name: dataProduct.name,
                        unit: list.unit,
                        qty: list.qty,
                        pricePerUnitRefund: unitsWithIdOne[0].pricePerUnitChange,
                        totalAmount: list.qty * unitsWithIdOne[0].pricePerUnitChange
                    }
                    // console.log(dataProduct)
                    datalListReturn.push(mainData)
                } else {
                }
            } else {
            }

            // console.log(dataProduct)
        }

        for (const list of req.body.listChange) {
            const dataProduct = await Product.findOne({id: list.id})

            if (dataProduct) {
                const unitsWithIdOne = dataProduct.unitList.filter(unit => unit.id === list.unit);
                console.log(unitsWithIdOne[0])
                if (unitsWithIdOne.length > 0) {
                    const mainData = {
                        id: dataProduct.id,
                        name: dataProduct.name,
                        unit: list.unit,
                        qty: list.qty,
                        pricePerUnitRefund: unitsWithIdOne[0].pricePerUnitRefund,
                        totalAmount: list.qty * unitsWithIdOne[0].pricePerUnitRefund
                    }
                    datalListChange.push(mainData)
                } else {
                }
            } else {
            }

        }

        const newData = {
            idIndex: idIndex,
            id: idUnq,
            saleMan: req.body.saleMan,
            storeId: req.body.storeId,
            storeName: req.body.storeName,
            totalReturn: req.body.totalReturn,
            totalChange: req.body.totalChange,
            diffAmount: req.body.diffAmount,
            listReturn: {
                id: idChange,
                list: datalListReturn
            },
            listChange: {
                id: idRepair,
                list: datalListChange
            },
            approve: {
                sender: req.body.saleMan,
                approved: '',
                dateSender: currentdateDash(),
                dateApprove: '',
                status: 'รออนุมัติ'
            },
            refundDate: currentdateDash()
        }
        await Refund.create(newData)
        // await updateAvailable(numberSeries.type, numberSeries.zone, idAvailable + 1)

        res.status(201).json({status: 201, message: 'Open Refund Successfully'})
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

refundProduct.post('/addCartRefund', async (req, res) => {
        try {
            if (req.body.type === 'change') {
                const idMirror = await CartRefund.findOne({ area: req.body.area, storeId: req.body.storeId,type:req.body.type });
                let listFound = false;

                if (idMirror) {
                    if (idMirror.list.length > 0) {
                        for (const list of idMirror.list) {
                            if (list.id === req.body.list[0].id && list.unitId === req.body.list[0].unitId) {
                                await CartRefund.updateOne({
                                    area: req.body.area,
                                    storeId: req.body.storeId,
                                    type:req.body.type,
                                    'list.id': req.body.list[0].id,
                                    'list.unitId': req.body.list[0].unitId
                                }, {
                                    $set: {
                                        'list.$.qty': list.qty + req.body.list[0].qty,
                                        'list.$.sumPrice': list.sumPrice + req.body.list[0].sumPrice
                                    }
                                });
                                listFound = true;
                                break;
                            }
                        }
                    }

                    if (!listFound && idMirror.list.every(item => item.unitId !== req.body.list[0].unitId)) {
                        await CartRefund.updateOne({
                            area: req.body.area,
                            storeId: req.body.storeId,
                            type:req.body.type,
                        }, { $push: { list: req.body.list } });
                    }
                } else {
                    req.body.productCondition = '1'
                    await CartRefund.create(req.body)
                }

                res.status(201).json({status: 201, message: 'AddProduct to cartRefund Successfully'})
            } else if (req.body.type === 'refund') {

                const idMirror = await CartRefund.findOne({ area: req.body.area, storeId: req.body.storeId,type:req.body.type });
                let listFound = false;

                if (idMirror) {
                    if (idMirror.list.length > 0) {
                        for (const list of idMirror.list) {
                            if (list.id === req.body.list[0].id && list.unitId === req.body.list[0].unitId) {
                                await CartRefund.updateOne({
                                    area: req.body.area,
                                    storeId: req.body.storeId,
                                    type:req.body.type,
                                    'list.id': req.body.list[0].id,
                                    'list.unitId': req.body.list[0].unitId
                                }, {
                                    $set: {
                                        'list.$.qty': list.qty + req.body.list[0].qty,
                                        'list.$.sumPrice': list.sumPrice + req.body.list[0].sumPrice
                                    }
                                });
                                listFound = true;
                                break;
                            }
                        }
                    }

                    if (!listFound && idMirror.list.every(item => item.unitId !== req.body.list[0].unitId)) {
                        await CartRefund.updateOne({
                            area: req.body.area,
                            storeId: req.body.storeId,
                            type:req.body.type,
                        }, { $push: { list: req.body.list } });
                    }
                } else {
                    await CartRefund.create(req.body)
                }
                res.status(201).json({status: 201, message: 'AddProduct to cartRefund Successfully'})
            } else {
                res.status(500).json({
                    status: 501,
                    message: 'type Not available or empty'
                })
            }
        } catch (e) {
            console.log(e)
            res.status(500).json({
                status: 500,
                message: e.message
            })
        }
    }
)


refundProduct.delete('/deleteItemCart', async (req, res) => {
        try {

                res.status(201).json({status: 201, message: 'Delete One Item cartRefund Successfully'})
        } catch (e) {
            console.log(e)
            res.status(500).json({
                status: 500,
                message: e.message
            })
        }
    }
)



module.exports = refundProduct

