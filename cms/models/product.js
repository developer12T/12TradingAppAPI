const mongoose = require('mongoose')


const skuList = mongoose.Schema({
    id: { type: String},
    name:{type:String},
    pricePerSku:{type:Number},

})

const productSchema = mongoose.Schema({
    idIndex:{type:Number},
    id:{type:String},
    name:{type:String},
    type:{type:String},
    brand:{type:String},
    size:{type:String},
    flavour:{type:String},
    skuList:[skuList],
    status:{type:String}
})

const Product = mongoose.model('Product',productSchema)
module.exports = { Product }