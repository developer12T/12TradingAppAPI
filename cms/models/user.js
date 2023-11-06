const mongoose = require('mongoose')

const roleSchema = mongoose.Schema({
    area:{type:String},
    role:{type:String}
})

const userSchema = mongoose.Schema({
    id:{type:String,require:true},
    nameUser:{type:String,require:true},
    firstName:{type:String,require:true},
    surName:{type:String,require:true},
    passWord:{type:String,require:true},
    description:roleSchema,
    zone:{type:String,require:true},
    status:{type:String,require:true}
})

const User = mongoose.model('User',userSchema)
module.exports = { User }