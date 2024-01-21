const mongoose = require('mongoose')

const list = mongoose.Schema(
    {
        id: String,
        name: String,
        qty: Number,
        unitQty: String,
        PricePerQty: Number,
        totalPrice: Number
    })

const approve = mongoose.Schema({
    dateSend: String,
    dateAction: String,
    appPerson: String
})

const giveProductSchema = mongoose.Schema(
    {
        id: String,
        area: String,
        storeId: String,
        type: String,
        totalPrice: Number,
        list: [list],
        status: String,
        approve: approve,
        createDate: String,
        updateDate: String
    })

const GiveProduct = mongoose.model('GiveProduct', giveProductSchema)

module.exports = {GiveProduct}