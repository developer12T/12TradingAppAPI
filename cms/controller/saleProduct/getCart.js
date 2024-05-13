const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {Store} = require("../../models/store")
const {Unit, Product} = require("../../models/product")
const {PreOrder} = require("../../models/order")
const {User} = require("../../models/user")
const _ = require('lodash')
const {createLog} = require("../../services/errorLog");
const axios = require("axios");
const getCart = express.Router()
const  { slicePackSize } = require('../../utils/utility')

getCart.post('/getCart', async (req, res) => {
    try {
        const data = await Cart.find({area: req.body.area, storeId: req.body.storeId})
        await createLog('200', req.method, req.originalUrl, res.body, 'getCart successfully')
        res.status(200).json(data)
    } catch (e) {
        await createLog('500', res.method, req.originalUrl, res.e, error.stack)
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
        if (data) {
            console.log('ไม่พบ')
            // console.log(data)
            const data_arr = []
            for (let i = 0; i < data.list.length; i++) {

                const detail_product = await Unit.findOne({idUnit: data.list[i].unitId})
                const list_obj = {
                    id: data.list[i].id,
                    name: slicePackSize(data.list[i].name),
                    nameDetail: data.list[i].name,
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
            await createLog('200', req.method, req.originalUrl, res.body, 'getCartToShow successfully')
            res.status(200).json(mainData)
        } else {
            console.log('พบ')
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

getCart.post('/getPreOrder', async (req, res) => {
    try {
        const data = await Cart.findOne({area: req.body.area, storeId: req.body.storeId}, {
            'list._id': 0,
            __v: 0,
            _id: 0
        })
        const dataPromotion = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/summaryCompare', {
            area: req.body.area,
            storeId: req.body.storeId
        })
        const responseData = dataPromotion.data
        console.log(responseData)
        if (data) {
            const dataUser = await User.findOne({saleCode: req.body.saleCode})
            const dataStore = await Store.findOne({storeId: req.body.storeId})
            const mainList = []
            for (const listdata of data.list) {
                const unitData = await Unit.findOne({idUnit: listdata.unitId})
                const dataList = {
                    id: listdata.id,
                    name: listdata.name,
                    nameDetail: slicePackSize(listdata.name),
                    qty: listdata.qty,
                    type: "buy",
                    nameQty: unitData.nameThai,
                    qtyText: listdata.qty + ' ' + unitData.nameThai,
                    pricePerQty: parseFloat(parseFloat(listdata.pricePerUnitSale).toFixed(2)),
                    discount: 0,
                    totalAmount: parseFloat(parseFloat(listdata.qty * listdata.pricePerUnitSale).toFixed(2))
                }
                mainList.push(dataList)
            }
            let listFree_Arr = []
            for (const listFreePro of responseData.listFree) {
                for (const listFreeItem of listFreePro.listProduct) {
                    const unitData = await Unit.findOne({idUnit: listFreeItem.unitQty})
                    const dataListFree = {
                        id: listFreeItem.productId,
                        name: slicePackSize(listFreeItem.productName),
                        nameDetail: listFreeItem.productName,
                        qty: listFreeItem.qty,
                        type: "free",
                        nameQty: listFreeItem.unitQty,
                        qtyText: listFreeItem.qty + ' ' + unitData.nameThai,
                        pricePerQty: '0.00',
                        discount: 0,
                        totalAmount: '0.00'
                    }
                    listFree_Arr.push(dataListFree)
                }
            }

            const mainData = {
                saleMan: dataUser.firstName + ' ' + dataUser.surName,
                storeId: data.storeId,
                storeName: dataStore.name,
                address: dataStore.address + ' ' + dataStore.distric + ' ' + dataStore.subDistric + ' ' + dataStore.province,
                taxID: dataStore.taxId,
                tel: dataStore.tel,
                totalAmount: parseFloat(data.totalPrice.toFixed(2)),
                discount: '0.00',
                totalAmountNoVat: parseFloat((data.totalPrice / 1.07).toFixed(2)),
                vat: parseFloat((data.totalPrice - (data.totalPrice / 1.07)).toFixed(2)),
                summaryAmount: parseFloat(data.totalPrice.toFixed(2)),
                list: mainList,
                listFree: listFree_Arr,
                shippingAddress: data.shipping.address,
                shippingDate: data.shipping.dateShip
            }
            await createLog('200', req.method, req.originalUrl, res.body, 'getPreOrder successfully')
            res.status(200).json(mainData)
        } else {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            res.status(200).json({
                status: 200,
                message: 'No Data'
            })
        }
    } catch
        (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
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
            // console.log(list)
            const dataProduct = await Product.findOne({id: list.id})
            const factoryCal = await Product.findOne({
                id: list.id,
                convertFact: {$elemMatch: {unitId: list.unitId}}
            }, {'convertFact.$': 1})

            const unitDetail = await Unit.findOne({idUnit: list.unitId})

            // console.log(factoryCal)
            if (unitDetail.nameThai === 'แผง') {
                listProductGroup.push({
                    id: list.id,
                    group: dataProduct.group,
                    brand: dataProduct.brand,
                    size: dataProduct.size,
                    flavour: dataProduct.flavour,
                    typeUnit: 'แผง',
                    qty: list.qty,
                    unitQty: unitDetail.nameEng,
                    qtyConvert: factoryCal.convertFact[0].factor * list.qty
                })
            } else {
                listProductGroup.push({
                    id: list.id,
                    group: dataProduct.group,
                    brand: dataProduct.brand,
                    size: dataProduct.size,
                    flavour: dataProduct.flavour,
                    typeUnit: 'ไม่แผง',
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

        const groupData_arr = []
        const groupDataListProduct_arr = []
        for (const listMainData of listProductGroup) {
            // console.log(listMainData)
            const groupData_obj = {
                group: listMainData.group,
                size: listMainData.size,
                // flavour: listMainData.flavour,
                typeUnit: listMainData.typeUnit,
                qty: listMainData.qtyConvert

            }
            groupData_arr.push(groupData_obj)
        }
        // console.log(groupData_arr)

        const groupedData = groupData_arr.reduce((acc, curr) => {
            const {group, size, typeUnit} = curr
            const key = `${group}/${size}/${typeUnit}`
            if (!acc[key]) {
                acc[key] = {
                    group,
                    size,
                    // flavour,
                    typeUnit,
                    qty: 0,
                }
            }
            acc[key].qty += curr.qty
            return acc
        }, {})

        // console.log(groupedData)

        const outputDataGroupSize = Object.keys(groupedData).sort().map((key) => {
            return groupedData[key]
        })

        const listProductGroupUnit = []
        var listProductGroupUnitListQty = []
        // console.log(listProductInGroup)
        for (const listProGroup of outputDataGroupSize) {
            // console.log(listProGroup)
            //  loop
            if (listProGroup.typeUnit === 'แผง') {

                const dataConvertion = await Product.findOne({
                    group: listProGroup.group,
                    size: listProGroup.size,
                    // flavour: listProGroup.flavour,
                    unitList: {$elemMatch: {id: '3'}}
                }, {convertFact: 1})

                for (listDataConvertion of dataConvertion.convertFact) {
                    const dataList = {
                        name: listDataConvertion.unitName,
                        qty: parseInt((listProGroup.qty / listDataConvertion.factor).toFixed(0))
                    }
                    listProductGroupUnitListQty.push(dataList)
                }
                listProGroup.converterUnit = listProductGroupUnitListQty
                listProductGroupUnitListQty = []
                // listProductGroupUnit.push(listProGroup)
            } else {

                // console.log('cz2')
                const dataConvertion2 = await Product.findOne({
                    group: listProGroup.group,
                    size: listProGroup.size,
                    // flavour: listProGroup.flavour,
                    "unitList.id": {
                        $nin: ['3']
                    }
                }, {convertFact: 1})
                for (listDataConvertion2 of dataConvertion2.convertFact) {
                    const dataList2 = {
                        name: listDataConvertion2.unitName,
                        qty: parseInt((listProGroup.qty / listDataConvertion2.factor).toFixed(0))
                    }
                    listProductGroupUnitListQty.push(dataList2)
                }
                listProGroup.converterUnit = listProductGroupUnitListQty
                listProductGroupUnitListQty = []
            }
            listProductGroupUnit.push(listProGroup)
            //  loop
        }

        //convert product type
        var dataUnitListProductConvert = []
        const productList = []
        for (const listCon of listProduct) {
            const dataConvertion = await Product.findOne({id: listCon.id}, {convertFact: 1, _id: 0})
            // console.log(dataConvertion)
            for (const convFactList of dataConvertion.convertFact) {
                const detail = {
                    name: convFactList.unitName,
                    qty: parseInt((listCon.qtyconvert / convFactList.factor).toFixed(0))
                }
                dataUnitListProductConvert.push(detail)
            }
            listCon.converterUnit = dataUnitListProductConvert
            productList.push(listCon)
            dataUnitListProductConvert = []
        }

        // ดึงข้อมูล สินค้าจากตะกร้ามาเพื่อเอาข้อมูลไปใช้ เริ่มต้น
        // console.log('cz')
        const listProductInGroup = []
        const dataProductCart = await Cart.findOne({area: req.body.area, storeId: req.body.storeId})
        // console.log(dataProductCart.list)

        for (const listDetailProduct of dataProductCart.list) {
            // console.log(listDetailProduct.id)
            const detailProduct = await Product.findOne({id: listDetailProduct.id}, {
                group: 1,
                size: 1,
                flavour: 1,
                id: 1,
                name: 1,
                _id: 0
            })
            // console.log(detailProduct)
            listProductInGroup.push(detailProduct)
        }
        // ดึงข้อมูล สินค้าจากตะกร้ามาเพื่อเอาข้อมูลไปใช้ สิ้นสุด
        const listProductGroupUnitModify = []
        for (const list of listProductGroupUnit) {
            // console.log(list)
            const subDataListPro = []
            for (const subList of listProductInGroup) {
                // console.log(subList)
                // if((list.group == subList.group) && (list.size == subList.size) && (list.flavour == subList.flavour)){
                if ((list.group == subList.group) && (list.size == subList.size)) {
                    // listProductGroupUnit.listProduct = subList
                    // console.log(c.id + list.group)
                    // console.log(list.converterUnit)
                    subDataListPro.push(
                        subList
                    )
                }
            }
            listProductGroupUnitModify.push({
                group: list.group,
                size: list.size,
                // flavour:list.flavour,
                typeUnit: list.typeUnit,
                qty: list.typeUnit,
                converterUnit: list.converterUnit,
                listProduct: subDataListPro
            })
        }

        const summaryMainData = {
            listProduct: productList,
            // listProductGroup: listProductGroupUnit,
            listProductGroup: listProductGroupUnitModify,
        }
        await createLog('200', req.method, req.originalUrl, res.body, 'getSummary successfully')
        res.status(200).json({typeStore: dataStore.type, list: summaryMainData,})
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getCart