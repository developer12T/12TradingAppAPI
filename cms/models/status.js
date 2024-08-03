const mongoose = require('mongoose')


const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
})


const statusSchema = mongoose.Schema(
    {
        id:{type:Number,require:true},
        description:{type:String,require:true},
        type:{type:String,require:true},
        list:[list],
        status:{type:String,require:true},
        modifyDate:{type:String,require:true},
        createDate:{type:String,require:true}
    })

const status = mongoose.model('status',statusSchema)

module.exports = { status }