const mongoose = require('mongoose')
const Schema = mongoose.Schema

const discount = new Schema({
    amount: {type: Number},
})

const itemBuy = new Schema({
    productId: {type: String},
    productNo: {type: String},
    productGroup: { type: [String] },
    productFlavour: { type: String },
    productBrand: { type: [String] },
    productSize: { type: [String] },
    productUnit: { type: String },
    productQty: { type: Number, default: 0 },
    productAmount: { type: Number, default: 0 }
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
    store: { type: [String], default: [] },
    typeStore: { type: [String], default: [] },
    zone: { type: [String], default: [] },
    area: { type: [String], default: [] },
    except: { type: [String], default: [] },
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
    qtyText: String,
    unitQty: String,
    unitQtyThai: String,
})

const listPromotion = new Schema({
    proId: String,
    proName: String,
    summaryQty:Number,
    listProduct:[listProduct],
})

const rewardSummarySchema = new Schema({
    area: String,
    storeId:String,
    listPromotion:[listPromotion],
    createDate:String,
    updateDate:String
})

const Promotionbk = mongoose.model('Promotionbk', promotionSchema)
const ProTypebk = mongoose.model('ProTypebk', proTypeSchema)
const Couponbk = mongoose.model('Couponbk', couponSchema)
const RewardReceiptbk = mongoose.model('RewardReceiptbk', rewardReceiptSchema)
const RewardSummarybk = mongoose.model('RewardSummarybk', rewardSummarySchema)
module.exports = { Promotionbk,ProTypebk,Couponbk,RewardReceiptbk,RewardSummarybk }