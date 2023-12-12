const mongoose = require('mongoose')

const shipping = mongoose.Schema({
    address:{type:String},
    dateShip:{type:String},
    note:{type:String}
})

const detailSchema = mongoose.Schema({
    id: { type: String, require: true},
    name: { type: String, require: true},
    pricePerUnitSale: { type: Number,toFixed: 2, default: 0.00 },
    qty:{type:Number,require:true},
    unitId:{type:String,require:true},
})

const cartSchema = mongoose.Schema({
    id:{type:String},
    area:{type:String},
    storeId:{type:String},
    totalPrice:{type: Number,toFixed: 2, default: 0.00},
    list:[detailSchema],
    shipping:shipping
})

const Cart = mongoose.model('Cart',cartSchema)
module.exports = { Cart }