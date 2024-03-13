const mongoose = require('mongoose')

    const detailSchema = mongoose.Schema(
        {
            start: { type: String, require: true}, 
            end: { type:String,require:true},
            available: { type: Number, require: true},
        }
    )

    const numberSeriesSchema = mongoose.Schema(
        {
            year:String,
           id:{type:Number,require:true},
           type:{type:String,require:true},
           zone:{type:String,require:true},
           detail:detailSchema,
           descript:{type:String,require:true},
           modifyDate:{type:String,require:true},
           createDate:{type:String,require:true}
        }, 
        { 
            timestamps:true  
        })
 
 const NumberSeries = mongoose.model('NumberSeries',numberSeriesSchema)
 module.exports = { NumberSeries }