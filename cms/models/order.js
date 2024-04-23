const mongoose = require('mongoose')

const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    group:{type:String},
    type:String,
    qty:{type:Number},
    pricePerQty:{type:Number},
    unitQty:{type:String},
    discount:{type:Number},
    totalAmount:{type:Number}
})
const shipping = mongoose.Schema({
    address:{type:String},
    dateShip:{type:String},
    note:{type:String}
})

const orderSchema = mongoose.Schema({
    // idIndex:{type:Number},
    orderNo:{type:String},
    saleMan:{type:String},
    saleCode:{type:String},
    area:String,
    storeId:{type:String},
    storeName:{type:String},
    address:{type:String},
    taxID:{type:String},
    tel:{type:String},
    totalPrice:{type:Number,toFixed: 2, default: 0.00},
    list:[list],
    shipping:shipping,
    status:{type:String},
    createDate:{type:String},
    updateDate:{type:String}

})


const shippingSchema = mongoose.Schema({
    id:{type:String},
    address:{type:String},
    dateShip:{type:String},
    note:{type:String}
})

const Order = mongoose.model('Order',orderSchema)
const Shipping = mongoose.model('Shipping',shippingSchema)
module.exports = { Order,Shipping }