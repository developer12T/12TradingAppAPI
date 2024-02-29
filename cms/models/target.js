const mongoose = require('mongoose')

const list = mongoose.Schema({
    id:String,
    name:String,
    targetMarket:Number,
    targetQty:Number,
    unit:String,
    list:[]
})

const targetSchema = mongoose.Schema({
    year:String,
    month:String,
    area:String,
    targetSale:{type:Number,toFixed: 2},
    data:[list]
})

const Target = mongoose.model('Target',targetSchema)
module.exports = { Target }