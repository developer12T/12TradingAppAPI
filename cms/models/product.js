const mongoose = require('mongoose')

const unitSchema = mongoose.Schema({
    idUnit: {type: String},
    nameThai: {type: String},
    nameEng: {type: String},
    createDate: {type: String},
    updateDate: {type: String}
})

const factList = mongoose.Schema({
    unitId: String,
    unitName: String,
    factor: Number,
    description:String
})

const unitList = mongoose.Schema({
    id: {type: String},
    name: {type: String},
    pricePerUnitSale: {type: Number, toFixed: 2, default: 0.00},
    pricePerUnitRefund: {type: Number, toFixed: 2, default: 0.00},
    pricePerUnitChange: {type: Number, toFixed: 2, default: 0.00},
})

const productSchema = mongoose.Schema({
    idIndex: {type: Number},
    id: {type: String},
    name: {type: String},
    group: {type: String},
    brand: {type: String},
    size: {type: String},
    flavour: {type: String},
    type: {type: String},
    statusSale: {type: String},
    statusWithdraw: {type: String},
    unitList: [unitList],
    status: {type: String},
    convertFact: [factList]
})

const Product = mongoose.model('Product', productSchema)
const Unit = mongoose.model('Unit', unitSchema)
module.exports = {Product, Unit}