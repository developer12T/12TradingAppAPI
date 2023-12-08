const mongoose = require('mongoose')

    const approveSchema = mongoose.Schema({
            status: { type: String, require: true}, // 0=รออนุมัติ ,1=อนุมัติ ,2=ไม่อนุมัติ
            dateSend:{ type:String,require:true},
            dateAction :{ type: String, require: true},
            appPerson:{ type: String, require: true}
        })

    const policyConsentSchema = mongoose.Schema({
            status: { type: String, require: true},
            date:{type:String,require:true},
        })

    const  imageSchema = mongoose.Schema({
            id: { type: Number, require: true},
            name:{ type:String,require:true},
            path:{ type:String,require:true},
            descript:{ type:String,require:true},
        })

    const storeSchema = mongoose.Schema(
        {
            storeId: { type: String, require: true },
            name:{type:String, require:true},
            taxId:{type:String,require:true},
            tel:{type:String,require:true},
            route:{type:String,require: true},
            type:{type:String,require:true},
            address:{type:String,require:true},
            distric:{type:String,require:true},
            subDistric:{type:String,require:true},
            province:{type:String,require:true},
            provinceCode:{type:String,require:true},
            postCode:{type:String,require:true},
            zone:{type:String,require:true},
            area:{type:String,require:true},
            latitude:{type:String,require:true},
            longtitude:{type:String,require:true},
            lineId:{type:String,require:true},
            approve:approveSchema,
            status:{type:String,require:false}, // 0=ปิด ,1=เปิด
            policyConsent:[policyConsentSchema],
            imageList:[imageSchema],
            note:{type:String,require:true},
            createdDate: { type: String,  },
            updatedDate: { type: String, }
        }, 
        { 
            timestamps:false
        })

    const typeStoreSchema = mongoose.Schema(
        {
           id:{type:String,require:true},
           name:{type:String,require:true},
           descript:{type:String,require:true},
           status:{type:String,require:true},
           modifyDate:{type:String,require:true},
           createDate:{type:String,require:true}
        }, 
        { 
            timestamps:true  
        })
 
 const Store = mongoose.model('Store',storeSchema)
 const TypeStore = mongoose.model('TypeStore',typeStoreSchema)
 
 module.exports = { Store,TypeStore }