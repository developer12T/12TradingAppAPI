const mongoose = require('mongoose')

const statusDesSchema = mongoose.Schema(
    {
        id:{type:Number,require:true},
        name:{type:String,require:true},
        descript:{type:String,require:true},
        type:{type:String,require:true},
        status:{type:String,require:true},
        modifyDate:{type:String,require:true},
        createDate:{type:String,require:true}
    },
    {
        timestamps:true
    })

const statusDes = mongoose.model('statusDes',statusDesSchema)

module.exports = { statusDes }