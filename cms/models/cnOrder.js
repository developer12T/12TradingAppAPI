const mongoose = require('mongoose')

const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    qty:{type:Number},
    note:String,
    unitId:{type:String},
    pricePerUnitRefund:{type:Number},
    totalAmount:{type:Number}
})
const shipping = mongoose.Schema({
    address:{type:String},
    dateShip:{type:String},
    note:{type:String}
})

const cnOrderSchema = mongoose.Schema({
    orderNo:{type:String},
    orderDate:String,
    storeId:{type:String},
    storeName:{type:String},
    address:{type:String},
    taxID:{type:String},
    tel:{type:String},
    note:String,
    totalPrice:{ type: Number,toFixed: 2, default: 0.00 },
    zone:String,
    area:String,
    saleCode:String,
    list:[list],
    shipping:shipping,
    noteCnOrder:String,
    status:{type:String},
    createDate:String
})

const detailSchema = mongoose.Schema({
    id: { type: String, require: true},
    name: { type: String, require: true},
    pricePerUnitRefund: { type: Number,toFixed: 2, default: 0.00 },
    qty:{type:Number,require:true},
    note:String,
    unitId:{type:String,require:true},
})

const cartCnSchema = mongoose.Schema({
    id:{type:String},
    area:{type:String},
    storeId:{type:String},
    totalPrice:{type: Number,toFixed: 2, default: 0.00},
    list:[detailSchema],
    shipping:shipping,
    noteCnOrder:String
})

const CnOrder = mongoose.model('cnOrder',cnOrderSchema)
const CartCn = mongoose.model('cartCn',cartCnSchema)
module.exports = { CnOrder,CartCn }