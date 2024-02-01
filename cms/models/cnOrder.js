const mongoose = require('mongoose')

const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    qty:{type:Number},
    unitQty:{type:String},
    pricePerQty:{type:Number},
    totalAmount:{type:Number}
})
const shipping = mongoose.Schema({
    address:{type:String},
    dateShip:{type:String},
    note:{type:String}
})

const cnOrderSchema = mongoose.Schema({
    id:{type:String},
    storeId:{type:String},
    storeName:{type:String},
    address:{type:String},
    taxID:{type:String},
    tel:{type:String},
    totalPrice:{ type: Number,toFixed: 2, default: 0.00 },
    list:[list],
    shipping:shipping,
    status:{type:String}
})

const detailSchema = mongoose.Schema({
    id: { type: String, require: true},
    name: { type: String, require: true},
    pricePerUnitRefund: { type: Number,toFixed: 2, default: 0.00 },
    qty:{type:Number,require:true},
    unitId:{type:String,require:true},
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