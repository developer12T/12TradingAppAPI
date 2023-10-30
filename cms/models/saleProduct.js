const mongoose = require('mongoose')

const detailSchema = mongoose.Schema({
    id: { type: String, require: true},
    name: { type: String, require: true},
    pricePerQty: { type: Number, require: true},
    qty:{type:String,require:true},
    typeQty:{type:String,require:true},
})

const cartSchema = mongoose.Schema({
    id:{type:String},
    area:{type:String},
    storeId:{type:String},
    totalPrice:{type:Number},
    list:[detailSchema],
})


const Cart = mongoose.model('Cart',cartSchema)
module.exports = { Cart }