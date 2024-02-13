const mongoose = require('mongoose')

const list = mongoose.Schema({
    id:String,
    name:String,
})


const targetSchema = mongoose.Schema({
    id:String,
    name:String,
    group:String,
    TargetBalance:{type:Number,toFixed: 2},
    list:[list]
})

const Target = mongoose.model('Target',targetSchema)
module.exports = { Target }