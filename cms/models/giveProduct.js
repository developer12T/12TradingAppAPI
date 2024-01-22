const mongoose = require('mongoose')

const list = mongoose.Schema(
    {
        id: String,
        name: String,
        qty: {type: Number,toFixed: 2, default: 0.00},
        unitQty: String,
        PricePerQty: {type: Number,toFixed: 2, default: 0.00},
        totalPrice: {type: Number,toFixed: 2, default: 0.00}
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
        totalPrice: {type: Number,toFixed: 2, default: 0.00},
        list: [list],
        status: String,
        approve: approve,
        createDate: String,
        updateDate: String
    })

const GiveProduct = mongoose.model('GiveProduct', giveProductSchema)

module.exports = {GiveProduct}