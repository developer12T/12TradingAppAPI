const mongoose = require('mongoose')

const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    qty:{type:Number},
    unit:{type:String},
    pricePerUnitRefund:{type:Number},
    totalAmount:{type:Number}
})

const listReturn = mongoose.Schema({
    id:{type:String},
    list:[list]
})

const listChange = mongoose.Schema({
    id:{type:String},
    list:[list]
})
const approve = mongoose.Schema({
    sender:{type:String},
    approved:{type:String},
    dateSender:{type:String},
    dateApprove:{type:String},
    status: {type:String}
})

const refundSchema = mongoose.Schema({
    idIndex:{type:Number},
    id:{type:String},
    saleMan:{type:String},
    storeId:{type:String},
    storeName:{type:String},
    totalReturn:{type:Number},
    totalChange:{type:Number},
    diffAmount:{type:Number},
    listReturn:listReturn,
    listChange:listChange,
    approve:approve,
    refundDate:{type:String}
})

const listRefundCart = mongoose.Schema({
    id: String,
    name: String,
    unitId: String,
    priceUnit: Number,
    qty: Number,
    sumPrice:Number,
    productCondition:String,
})

const cartRefundSchema = mongoose.Schema({
    area:{type:String},
    storeId:{type:String},
    type:String,
    list:[listRefundCart]
})

const Refund = mongoose.model('Refund',refundSchema)
const CartRefund = mongoose.model('cartRefund',cartRefundSchema)

module.exports = { Refund,CartRefund }