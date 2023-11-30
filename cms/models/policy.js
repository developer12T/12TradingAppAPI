const mongoose = require('mongoose')

const list = mongoose.Schema({

})

const policySchema = mongoose.Schema({

    "title1":String,
    "subTitile1":String,
    "subTitile2":String,
    "subTitile3":String,
    "title2":String,
    "subTitle21":String,
    "subTitle22": String,
    "subTitile31":String,
    "subTitile32":String
})


const Policy = mongoose.model('Policy',policySchema)

module.exports = { Policy }