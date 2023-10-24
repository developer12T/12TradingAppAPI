const mongoose = require('mongoose')

const routeSchema = mongoose.Schema(
    {
        id:{type:Number,require:true},
        name:{type:String,require:true},
        description:{type:String,require:true}
    })

const Route = mongoose.model('Route',routeSchema)
module.exports = { Route }