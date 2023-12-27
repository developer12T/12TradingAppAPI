const mongoose = require('mongoose')

const ErrorLogSchema = mongoose.Schema(
    {
        status:String,
        method:String,
        pathApi:{type:String,require:true},
        dataBody:Object,
        message:String,
        dateCreate:String
    })

const ErrorLog = mongoose.model('ErrorLog',ErrorLogSchema)
module.exports = { ErrorLog }