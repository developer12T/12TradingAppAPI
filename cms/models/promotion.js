const mongoose = require('mongoose')
const Schema = mongoose.Schema

const discount = new Schema({
    amount: {type: Number},
})

const itemBuy = new Schema({
    productId: {type: String},
    productNo: {type: String},
    productGroup: {type: String},
    productFlavour: {type: String},
    productBrand: {type: String},
    productSize: {type: String},
    productUnit: {type: String},
    productQty: {type: Number},
    productAmount: {type: Number}
})

const itemFree = new Schema({
    productId: {type: String},
    productGroup: {type: String},
    productFlavour: {type: String},
    productBrand: {type: String},
    productSize: {type: String},
    productUnit: {type: String},
    productQty: {type: String}
})

const promotionSchema = new Schema({
    proId: {type: String},
    name: {type: String},
    description: {type: String},
    proType: {type: String},
    coupon: {type: String},
    store: [],
    typeStore: [],
    zone: [],
    area: [],
    except: [],
    itembuy: [itemBuy],
    itemfree: [itemFree],
    discount: [discount]
})

const Promotion = mongoose.model('Promotion', promotionSchema)
module.exports = {Promotion}