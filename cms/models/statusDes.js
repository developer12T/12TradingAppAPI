const mongoose = require('mongoose')


const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
})


const statusDesSchema = mongoose.Schema(
    {
        id:{type:Number,require:true},
        // name:{type:String,require:true},
        descript:{type:String,require:true},
        type:{type:String,require:true},
        list:[list],
        status:{type:String,require:true},
        modifyDate:{type:String,require:true},
        createDate:{type:String,require:true}
    })

const statusDes = mongoose.model('statusDes',statusDesSchema)

module.exports = { statusDes }