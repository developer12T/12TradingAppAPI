const mongoose = require('mongoose')

const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    type:{type:String},
    qty:{type:Number},
    pricePerQty:{type:Number},
    unitQty:{type:String},
    amount:{type:Number},
    note:{type:String},
    lot:{type:String},
    exp:{type:String}
})

const shipping = mongoose.Schema({
    address:{type:String},
    dateShip:{type:String},
    note:{type:String}
})

const cnOrderSchema = mongoose.Schema({
    orderNo:{type:String},
    saleMan:{type:String},
    saleCode:{type:String},
    area:{type:String},
    storeId:{type:String},
    storeName:{type:String},
    address:{type:String},
    taxID:{type:String},
    tel:{type:String},
    warehouse:{type:String},
    note:{type:String},
    latitude:{type:String},
    longtitude:{type:String},
    totalAmount:{ type: Number,toFixed: 2, default: 0.00 },
    list:[list],
    shipping:shipping,
    status:{type:String},
    createDate:{type:String},
    updateDate:{type:String},
    refOrder:{type:String}
})

const detailSchema = mongoose.Schema({
    id: { type: String, require: true},
    name: { type: String, require: true},
    pricePerUnitRefund: { type: Number,toFixed: 2, default: 0.00 },
    qty:{type:Number,require:true},
    unitId:{type:String,require:true},
    note:String
})

const cartCnSchema = mongoose.Schema({
    id:{type:String},
    area:{type:String},
    storeId:{type:String},
    totalPrice:{type: Number,toFixed: 2, default: 0.00},
    list:[detailSchema],
    shipping:shipping
})

const CnOrder = mongoose.model('cnOrder',cnOrderSchema)
const CartCn = mongoose.model('cartCn',cartCnSchema)
module.exports = { CnOrder,CartCn }