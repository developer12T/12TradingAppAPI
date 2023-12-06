const express = require('express')

require('../../configs/connect')
const {Cart} = require("../../models/saleProduct")
const {Store} = require("../../models/store")
const {Unit} = require("../../models/product");
const {PreOrder} = require("../../models/order");
const {User} = require("../../models/user");

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
        const data_arr = []
        for (let i = 0; i < data.list.length; i++) {

            const detail_product = await Unit.findOne({idUnit:data.list[i].unitId})
            const list_obj = {
                id: data.list[i].id,
                name: data.list[i].name,
                qtyText: data.list[i].qty+' '+ detail_product.nameThai,
                qty: data.list[i].qty,
                unitId:data.list[i].unitId,
                unitTypeThai:detail_product.nameThai,
                unitTypeEng:detail_product.nameEng,
                summaryPrice:  parseFloat(data.list[i].pricePerUnitSale * data.list[i].qty).toFixed(2)
            }
            totalAmount = totalAmount + (data.list[i].pricePerUnitSale * data.list[i].qty)
            data_arr.push(list_obj)
        }

        const storeData = await Store.findOne({
            idCharecter: req.body.storeId.substring(0, 3), idNumber: req.body.storeId.substring(3)
        }, {})
        const mainData = {
            idCart: data.id,
            storeId: storeData.idCharecter + storeData.idNumber,
            name: storeData.name,
            totalQuantity: data_arr.length,
            totalAmount:  parseFloat(totalAmount).toFixed(2),
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
        const { spltitString } = require('../../utils/utility')
        const idSplit = await spltitString(req.body.storeId)
        const data = await Cart.findOne({area: req.body.area,storeId:req.body.storeId},{'list._id':0,__v:0,_id:0})
        const dataUser = await User.findOne({saleCode:req.body.saleCode})
        const dataStore = await Store.findOne({idCharecter:idSplit.prefix ,idNumber:idSplit.subfix})
        const mainList = []
        for (const listdata of data.list){
            const unitData = await Unit.findOne({idUnit:listdata.unitId})
            const dataList = {
                id: listdata.id,
                name:listdata.name,
                qty:listdata.qty,
                nameQty:unitData.nameThai,
                qtyText:listdata.qty + ' '+unitData.nameThai,
                pricePerQty:parseFloat(listdata.pricePerUnitSale).toFixed(2),
                discount:0,
                totalAmount:parseFloat(listdata.qty * listdata.pricePerUnitSale).toFixed(2)
            }
            mainList.push(dataList)
        }

        const mainData = {
            saleMan: dataUser.firstName + ' '+dataUser.surName,
            storeId: data.storeId,
            storeName: dataStore.name,
            address: dataStore.addressTitle +' ' +dataStore.distric +' '+dataStore.subDistric+' '+dataStore.province,
            taxID: dataStore.taxId,
            tel: dataStore.tel,
            totalAmount:data.totalPrice.toFixed(2),
            discount: '0.00',
            totalAmountNoVat:(data.totalPrice/1.07).toFixed (2),
            vat:(data.totalPrice-(data.totalPrice/1.07)).toFixed(2),
            summaryAmount:data.totalPrice.toFixed(2),
            list:mainList,
            shippingAddress:data.shipping.address,
            shippingDate:data.shipping.dateShip
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

module.exports = getCart