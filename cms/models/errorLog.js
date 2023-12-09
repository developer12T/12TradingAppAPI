const mongoose = require('mongoose')

const ErrorLogSchema = mongoose.Schema(
    {
        status:String,
        pathApi:{type:String,require:true},
        message:{type:String,require:true},
        dateCreate:String
    })

const ErrorLog = mongoose.model('ErrorLog',ErrorLogSchema)
module.exports = { ErrorLog }