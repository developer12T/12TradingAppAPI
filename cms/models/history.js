const mongoose = require('mongoose')

const HistorySchema = mongoose.Schema(
    {
        type:{type:String,require:true},
        collectionName:{type:String,require:true},
        description:{type:String,require:true}
    })

const History = mongoose.model('History',HistorySchema)
module.exports = { History }