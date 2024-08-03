const mongoose = require('mongoose')


const list = mongoose.Schema({
    id: { type: String},
    name:{type:String},
})


const reasonSchema = mongoose.Schema(
    {
        type:String,
        description:{type:String,require:true},
        list:[list],
        status:{type:String,require:true},
        modifyDate:{type:String,require:true},
        createDate:{type:String,require:true}
    })

const Reason = mongoose.model('reason',reasonSchema)

module.exports = { Reason }