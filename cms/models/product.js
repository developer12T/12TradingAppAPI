const mongoose = require('mongoose')

const unitSchema = mongoose.Schema({
    idUnit:{type:Number},
    nameThai:{type:String},
    nameEng:{type:String},
    createDate:{type:String},
    updateDate:{type:String}
})

const unitList = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    pricePerUnitSale:{type:Number},
    pricePerUnitRefund:{type:Number},
    pricePerUnitChange:{type:Number}
})

const productSchema = mongoose.Schema({
    idIndex:{type:Number},
    id:{type:String},
    name:{type:String},
    type:{type:String},
    brand:{type:String},
    size:{type:String},
    flavour:{type:String},
    unitList:[unitList],
    status:{type:String}
})


const Product = mongoose.model('Product',productSchema)
const Unit = mongoose.model('Unit',unitSchema)
module.exports = { Product,Unit }