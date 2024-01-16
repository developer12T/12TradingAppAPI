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
    productQty: {type: Number}
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

const proTypeSchema = new Schema({
    name: {type: String},
    description: {type: String},
    createDate:String,
    updateDate:String
})

const couponSchema = new Schema({
    name: {type: String},
    code:String,
    description: {type: String},
    createDate:String,
    updateDate:String
})

const listFreeItem = new Schema({
    productId:String,
    productName:String,
    qty:Number,
    unitQty:String
})

const listProductFreeGroup = new Schema({
    id:String,
    name:String,
})

const listFreeGroup = new Schema({
    group: String,
    size: String,
    proId:String,
    qtyReward: Number,
    qtyUnit: String,
    listProduct: [listProductFreeGroup]
})

const rewardReceiptSchema = new Schema({
    area: String,
    storeId:String,
    proId: String,
    listFreeItem:[listFreeItem],
    listFreeGroup:[listFreeGroup],
    createDate:String,
    updateDate:String
})

const listProduct = new Schema({
    productId: String,
    productName: String,
    qty: Number,
    unitQty: String,
})

const rewardSummarySchema = new Schema({
    area: String,
    storeId:String,
    proId: String,
    summaryQty:Number,
    list:[listProduct],
    createDate:String,
    updateDate:String
})

const Promotion = mongoose.model('Promotion', promotionSchema)
const ProType = mongoose.model('ProType', proTypeSchema)
const Coupon = mongoose.model('Coupon', couponSchema)
const RewardReceipt = mongoose.model('RewardReceipt', rewardReceiptSchema)
const RewardSummary = mongoose.model('RewardSummary', rewardSummarySchema)
module.exports = { Promotion,ProType,Coupon,RewardReceipt,RewardSummary }