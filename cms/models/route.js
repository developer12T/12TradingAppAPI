const mongoose = require('mongoose')

const routeSchema = mongoose.Schema({
        id:{type:String,require:true},
        area:{type:String,require:true},
        list: [{
        type: String,
        required: true
        }],
    })

const detailSchema = mongoose.Schema({
    storeId: { type: String, require: true},
    lat:{type:String,require:true},
    long:{type:String,require:true},
    note:{type:String,require:true},
    status:{type:String,require:true},
    dateCheck:{type:String,require:true},
    personCheck:{type:String,require:true}
})

const checkInSchema = mongoose.Schema({
    id:{type:String},
    detail:[detailSchema],
})




const Route = mongoose.model('Route',routeSchema)
const Checkin = mongoose.model('Checkin',checkInSchema)
module.exports = { Route,Checkin }