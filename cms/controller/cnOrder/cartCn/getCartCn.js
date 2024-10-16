const express = require('express')
require('../../../configs/connect')
const { createLog } = require('../../../services/errorLog')
const { CnOrder, CartCn } = require('../../../models/cnOrder')
const { Unit, Product } = require('../../../models/product')
const { Store } = require('../../../models/store')
const { User } = require('../../../models/user')
const { errResponse } = require('../../../services/errorResponse')
const { slicePackSize } = require('../../../utils/utility')
const getCartCn = express.Router()

getCartCn.get('/getCartCnAll', async (req, res) => {
    try {
        const data = await CartCn.find()
        if (data) {
            await createLog('200', req.method, req.originalUrl, res.body, 'GetAll GiveProduct Successfully!')
            res.status(200).json(data)
        } else {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            await errResponse(res)
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
getCartCn.post('/getCartCn', async (req, res) => {
    try {
        // const data = await CartCn.find({req.body,_id:0})
        const data = await CartCn.find({ area: req.body.area, storeId: req.body.storeId }, { _id: 0 })
        if (data) {
            await createLog('200', req.method, req.originalUrl, res.body, 'GetCnCart Successfully!')
            res.status(200).json(data)
        } else {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            await errResponse(res)
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

getCartCn.post('/getCartToShow', async (req, res) => {
    try {
        var totalAmount = 0
        const data = await CartCn.findOne({ area: req.body.area, storeId: req.body.storeId })
        if (data) {
            // console.log('ไม่พบ')
            // console.log(data)
            const data_arr = []
            for (let i = 0; i < data.list.length; i++) {

                const detail_product = await Unit.findOne({ idUnit: data.list[i].unitId })
                const list_obj = {
                    id: data.list[i].id,
                    name: slicePackSize(data.list[i].name),
                    nameDetail: data.list[i].name,
                    qtyText: data.list[i].qty + ' ' + detail_product.nameThai,
                    qty: data.list[i].qty,
                    unitId: data.list[i].unitId,
                    unitTypeThai: detail_product.nameThai,
                    unitTypeEng: detail_product.nameEng,
                    summaryPrice: parseFloat(data.list[i].pricePerUnitRefund * data.list[i].qty).toFixed(2)
                }
                totalAmount = totalAmount + (data.list[i].pricePerUnitRefund * data.list[i].qty)
                data_arr.push(list_obj)
            }

            const storeData = await Store.findOne({
                storeId: req.body.storeId
            }, {})
            const mainData = {
                idCart: data.id,
                storeId: storeData.storeId,
                name: storeData.name,
                totalQuantity: data_arr.length,
                totalAmount: parseFloat(totalAmount).toFixed(2),
                list: data_arr
            }
            await createLog('200', req.method, req.originalUrl, res.body, 'getCartToShow successfully')
            res.status(200).json(mainData)
        } else {
            // console.log('พบ')
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            res.status(200).json({
                status: 204,
                message: 'No Data'
            })
        }
    } catch (error) {
        console.log(error)
        await createLog('500', res.method, req.originalUrl, res.e, error.stack)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

getCartCn.post('/getCnCheckout', async (req, res) => {
    try {
        const data = await CartCn.findOne({ area: req.body.area, storeId: req.body.storeId }, {
            'list._id': 0,
            __v: 0,
            _id: 0
        })

        if (data) {
            const dataUser = await User.findOne({ saleCode: req.body.saleCode });
            const dataStore = await Store.findOne({ storeId: req.body.storeId });
            const mainList = [];

            for (const listdata of data.list) {
                const unitData = await Unit.findOne({ idUnit: listdata.unitId });
                const dataList = {
                    id: listdata.id,
                    name: listdata.name,
                    nameDetail: slicePackSize(listdata.name),
                    qty: listdata.qty,
                    type: 'refund',
                    unitQty: unitData ? unitData.idUnit : '',
                    nameQty: unitData ? unitData.nameThai : '',
                    qtyText: listdata.qty + ' ' + (unitData ? unitData.nameThai : ''),
                    pricePerQty: parseFloat(parseFloat(listdata.pricePerUnitRefund).toFixed(2)),
                    amount: parseFloat(parseFloat(listdata.qty * listdata.pricePerUnitRefund).toFixed(2)),
                    note: '',
                    lot: listdata.lot,
                    exp: listdata.exp
                }
                mainList.push(dataList)
            }

            const totalAmountSum = mainList.reduce((sum, item) => sum + item.amount, 0)

            const mainData = {
                saleMan: dataUser.firstName + ' ' + dataUser.surName,
                storeId: data.storeId,
                storeName: dataStore.name,
                address: dataStore.address + ' ' + dataStore.district + ' ' + dataStore.subDistrict + ' ' + dataStore.province,
                taxID: dataStore.taxId,
                tel: dataStore.tel,
                totalAmount: parseFloat(totalAmountSum.toFixed(2)),
                totalAmountNoVat: parseFloat((totalAmountSum / 1.07).toFixed(2)),
                vat: parseFloat((totalAmountSum - (totalAmountSum / 1.07)).toFixed(2)),
                summaryAmount: parseFloat(totalAmountSum.toFixed(2)),
                list: mainList,
                shippingAddress: data.shipping.address,
                shippingDate: data.shipping.dateShip
            };

            await createLog('200', req.method, req.originalUrl, res.body, 'getPreOrder successfully')
            res.status(200).json(mainData)
        } else {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            res.status(200).json({
                status: 200,
                message: 'No Data'
            });
        }
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getCartCn
