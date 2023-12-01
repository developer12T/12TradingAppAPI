const mongoose = require('mongoose')

const list = mongoose.Schema({
        title:String,
        text:String
})

const policySchema = mongoose.Schema({
    id:Number,
    list:[list]
})

const Policy = mongoose.model('Policy',policySchema)

module.exports = { Policy }