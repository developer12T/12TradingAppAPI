const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Discount = new Schema({
    amount: {type: Number},
})

const ItemCondition = new Schema({
    productId: {type: String},
    productNo: {type: String},
    productGroup: { type: [String], default: [] },
    productFlavour: { type: String },
    productBrand: { type: [String], default: [] },
    productSize: { type: [String], default: [] },
    productUnit: { type: String },
    productQty: { type: Number, default: 0 },
    productAmount: { type: Number, default: 0 }
})

const ItemFree = new Schema({
    productId: {type: String},
    productGroup: {type: String},
    productFlavour: {type: String},
    productBrand: {type: String},
    productSize: {type: String},
    productUnit: {type: String},
    productQty: {type: Number}
})

const PromotionSchema = new Schema({
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
    conditions: [ItemCondition],
    rewards: [ItemFree],
    discounts: [Discount]
})

const ProTypeSchema = new Schema({
    name: {type: String},
    description: {type: String},
    createDate: {type: String},
    updateDate: {type: String}
})

const CouponSchema = new Schema({
    name: {type: String},
    code: {type: String},
    description: {type: String},
    createDate: {type: String},
    updateDate: {type: String}
})

const ListFreeItem = new Schema({
    productId: {type: String},
    productName: {type: String},
    qty: {type: Number},
    unitQty: {type: String}
})

const ListProductFreeGroup = new Schema({
    id: {type: String},
    name: {type: String},
})

const ListFreeGroup = new Schema({
    group: {type: String},
    size: {type: String},
    proId: {type: String},
    qtyReward: {type: Number},
    qtyUnit: {type: String},
    listProduct: [ListProductFreeGroup]
})

const RewardReceiptSchema = new Schema({
    area: {type: String},
    storeId: {type: String},
    proId: {type: String},
    listFreeItem: [ListFreeItem],
    listFreeGroup: [ListFreeGroup],
    createDate: {type: String},
    updateDate: {type: String}
})

const ListProduct = new Schema({
    productId: {type: String},
    productName: {type: String},
    qty: {type: Number},
    qtyText: {type: String},
    unitQty: {type: String},
    unitQtyThai: {type: String}
})

const ListPromotion = new Schema({
    proId: {type: String},
    proName: {type: String},
    summaryQty: {type: Number},
    listProduct: [ListProduct],
})

const RewardSummarySchema = new Schema({
    area: {type: String},
    storeId: {type: String},
    listPromotion: [ListPromotion],
    createDate: {type: String},
    updateDate: {type: String}
})

const Promotion = mongoose.model('Promotion', PromotionSchema)
const ProType = mongoose.model('ProType', ProTypeSchema)
const Coupon = mongoose.model('Coupon', CouponSchema)
const RewardReceipt = mongoose.model('RewardReceipt', RewardReceiptSchema)
const RewardSummary = mongoose.model('RewardSummary', RewardSummarySchema)

module.exports = { Promotion, ProType, Coupon, RewardReceipt, RewardSummary }
