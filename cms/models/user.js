 const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    id:{type:String,require:true},
    saleCode:String,
    salePayer:String,
    userName:{type:String,require:true},
    firstName:{type:String,require:true},
    surName:{type:String,require:true},
    passWord:{type:String,require:true},
    area:{type:String},
    role:{type:String},
    zone:{type:String,require:true},
    status:{type:String,require:true}
})

const User = mongoose.model('User',userSchema)
module.exports = { User }