const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {Store} = require("../../models/store")
const {Unit, Product} = require("../../models/product");
const {PreOrder} = require("../../models/order");
const {User} = require("../../models/user");
const _ = require('lodash')
const getCart = express.Router()

getCart.post('/getCart', async (req, res) => {
    try {
        const data = await Cart.find({area: req.body.area, storeId: req.body.storeId})
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})
getCart.post('/getCartToShow', async (req, res) => {
    try {
        var totalAmount = 0
        const data = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        // console.log(data)
        const data_arr = []
        for (let i = 0; i < data.list.length; i++) {

            const detail_product = await Unit.findOne({idUnit: data.list[i].unitId})
            const list_obj = {
                id: data.list[i].id,
                name: data.list[i].name,
                qtyText: data.list[i].qty + ' ' + detail_product.nameThai,
                qty: data.list[i].qty,
                unitId: data.list[i].unitId,
                unitTypeThai: detail_product.nameThai,
                unitTypeEng: detail_product.nameEng,
                summaryPrice: parseFloat(data.list[i].pricePerUnitSale * data.list[i].qty).toFixed(2)
            }
            totalAmount = totalAmount + (data.list[i].pricePerUnitSale * data.list[i].qty)
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
        res.status(200).json(mainData)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

getCart.post('/getPreOrder', async (req, res) => {
    try {
        const data = await Cart.findOne({area: req.body.area, storeId: req.body.storeId}, {
            'list._id': 0,
            __v: 0,
            _id: 0
        })
        const dataUser = await User.findOne({saleCode: req.body.saleCode})
        const dataStore = await Store.findOne({storeId: req.body.storeId})
        const mainList = []
        for (const listdata of data.list) {
            const unitData = await Unit.findOne({idUnit: listdata.unitId})
            const dataList = {
                id: listdata.id,
                name: listdata.name,
                qty: listdata.qty,
                nameQty: unitData.nameThai,
                qtyText: listdata.qty + ' ' + unitData.nameThai,
                pricePerQty: parseFloat(listdata.pricePerUnitSale).toFixed(2),
                discount: 0,
                totalAmount: parseFloat(listdata.qty * listdata.pricePerUnitSale).toFixed(2)
            }
            mainList.push(dataList)
        }

        const mainData = {
            saleMan: dataUser.firstName + ' ' + dataUser.surName,
            storeId: data.storeId,
            storeName: dataStore.name,
            address: dataStore.address + ' ' + dataStore.distric + ' ' + dataStore.subDistric + ' ' + dataStore.province,
            taxID: dataStore.taxId,
            tel: dataStore.tel,
            totalAmount: data.totalPrice.toFixed(2),
            discount: '0.00',
            totalAmountNoVat: (data.totalPrice / 1.07).toFixed(2),
            vat: (data.totalPrice - (data.totalPrice / 1.07)).toFixed(2),
            summaryAmount: data.totalPrice.toFixed(2),
            list: mainList,
            shippingAddress: data.shipping.address,
            shippingDate: data.shipping.dateShip
        }
        res.status(200).json(mainData)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

getCart.post('/getSummaryCart', async (req, res) => {
    try {
        const data = await Cart.findOne({area: req.body.area, storeId: req.body.storeId}, {
            'list._id': 0,
            __v: 0,
            _id: 0
        })
        const dataStore = await Store.findOne({area: req.body.area, storeId: req.body.storeId}, {__v: 0, _id: 0})
        const listProduct = []
        const listProductGroup = []
        for (const list of data.list) {
            console.log(list)
            const dataProduct = await Product.findOne({id: list.id})
            const factoryCal = await Product.findOne({
                id: list.id,
                convertFact: {$elemMatch: {unitId: list.unitId}}
            }, {'convertFact.$': 1})

            const unitDetail = await Unit.findOne({idUnit: list.unitId})

            console.log(factoryCal)
            if(unitDetail.nameThai === 'แผง'){
                listProductGroup.push({
                    id: list.id,
                    group: dataProduct.group,
                    brand: dataProduct.brand,
                    size: dataProduct.size,
                    flavour: dataProduct.flavour,
                    typeUnit:'แผง',
                    qty: list.qty,
                    unitQty: unitDetail.nameEng,
                    qtyConvert: factoryCal.convertFact[0].factor * list.qty
                })
            }else {
                listProductGroup.push({
                    id: list.id,
                    group: dataProduct.group,
                    brand: dataProduct.brand,
                    size: dataProduct.size,
                    flavour: dataProduct.flavour,
                    typeUnit:'ไม่แผง',
                    qty: list.qty,
                    unitQty: unitDetail.nameEng,
                    qtyConvert: factoryCal.convertFact[0].factor * list.qty
                })
            }

            listProduct.push({
                id: list.id,
                qtyPurc: list.qty,
                qtyUnitId: list.unitId,
                qtyUnitName: unitDetail.nameEng,
                qtyconvert: factoryCal.convertFact[0].factor * list.qty
            })

        }

        // const summaryGroup = _(listProductGroup)
        //     .groupBy('group')
        //     .map((group, key) => ({
        //         group: key,
        //         // size:group,
        //         sumQtyPcs: _.sumBy(group, 'qtyConvert')
        //     }))
        //     .value()

        // const summarySize = _(listProductGroup)
        //     .groupBy('size')
        //     .map((group, key) => ({
        //         group: key,
        //         sumQtyPcs: _.sumBy(group, 'qtyConvert')
        //     }))
        //     .value()

        const groupData_arr = []
        for (const listMainData of listProductGroup) {
            const groupData_obj = {
                group: listMainData.group,
                size: listMainData.size,
                flavour: listMainData.flavour,
                typeUnit: listMainData.typeUnit,
                qty: listMainData.qty
            }
            groupData_arr.push(groupData_obj)
        }

        const groupedData = groupData_arr.reduce((acc, curr) => {
            const {group, size, flavour,typeUnit} = curr;
            const key = `${group}/${size}`
            if (!acc[key]) {
                acc[key] = {
                    group,
                    size,
                    flavour,
                    typeUnit,
                    qty: 0,
                }
            }
            acc[key].qty += curr.qty

            return acc
        }, {})

        const outputDataGroupSize = Object.keys(groupedData).sort().map((key) => {
            return groupedData[key]
        })

        for (const listProGroup of outputDataGroupSize) {
            // const dataConvertion = await Product.find({
            //     group: listProGroup.group,
            //     size: listProGroup.size,
            //     flavour: listProGroup.flavour
            // }, {})
            // console.log(dataConvertion[0].convertFact)
        }

        const summaryMainData = {
            listProduct: listProduct,
            // listProductGroup: listProductGroup,
            listProductGroup: outputDataGroupSize,
            // listProductSize:summarySize
        }

        res.status(200).json({typeStore: dataStore.type, list: summaryMainData,})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getCart