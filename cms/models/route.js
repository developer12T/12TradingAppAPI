const mongoose = require('mongoose')

const listCheck = mongoose.Schema({
    number: { type: Number, },
    orderId: { type: String, require: true },
    date: { type: String, require: true },
})

const list = mongoose.Schema({
    storeId: { type: String, require: true },
    latitude: { type: String, require: true },
    longtitude: { type: String, require: true },
    note: { type: String, require: true },
    status: { type: String, require: true },
    dateCheck: { type: String, require: true },
    listCheck: [listCheck]
})

const routeSchema = mongoose.Schema({
    id: { type: String, require: true },
    area: { type: String, require: true },
    period: { type: String },
    list: [list],
})

// const checkInSchema = mongoose.Schema({
//     id:{type:String},
//     detail:[detailSchema],
// })

const Route = mongoose.model('Route', routeSchema)
// const Checkin = mongoose.model('Checkin',checkInSchema)
module.exports = { Route }