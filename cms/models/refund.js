const mongoose = require('mongoose')

const listReturn = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    qty:{type:Number},
    pricePerQty:{type:Number},
    totalAmount:{type:Number}
})

const listChange = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    qty:{type:Number},
    pricePerQty:{type:Number},
    totalAmount:{type:Number}
})

const refundSchema = mongoose.Schema({
    idIndex:{type:Number},
    id:{type:String},
    saleMan:{type:String},
    storeId:{type:String},
    storeName:{type:String},
    storeName:{type:String},
    listReturn:[listReturn],
    listChange:[listChange],
    refundDate:{type:String},
    status:{type:String}
})



const Refund = mongoose.model('Refund',refundSchema)

module.exports = { Refund }