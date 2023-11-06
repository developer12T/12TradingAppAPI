const mongoose = require('mongoose')

const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    qty:{type:Number},
    pricePerQty:{type:Number},
    discount:{type:Number},
    totalAmount:{type:Number}
})

const orderSchema = mongoose.Schema({
    idIndex:{type:Number},
    id:{type:String},
    saleMan:{type:String},
    storeId:{type:String},
    storeName:{type:String},
    address:{type:String},
    taxID:{type:String},
    tel:{type:String},
    list:[list],
    status:{type:String}
})

const preOrderSchema = mongoose.Schema({
    idIndex:{type:Number},
    id:{type:String},
    saleMan:{type:String},
    storeId:{type:String},
    storeName:{type:String},
    address:{type:String},
    taxID:{type:String},
    tel:{type:String},
    list:[list],
    status:{type:String}
})

const Order = mongoose.model('Order',orderSchema)
const PreOrder = mongoose.model('PreOrder',preOrderSchema)
module.exports = { Order,PreOrder }