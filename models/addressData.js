const mongoose = require('mongoose')

    const addressDataSchema = mongoose.Schema(
        {
           district:{type:String,require:true},
           amphoe:{type:String,require:true},
           province:{type:String,require:true},
           zipcode:{type:String,require:true},
           district_code:{type:String,require:true},
           amphoe_code:{type:String,require:true},
           province_code:{type:String,require:true}
        })
 
 const Address = mongoose.model('Address',addressDataSchema)

 module.exports = { Address }