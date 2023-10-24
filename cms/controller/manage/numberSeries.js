const express = require('express')
require('../../configs/connect')
const numberSeries = express.Router()
const { NumberSeries } = require('../../models/numberSeries')

numberSeries.post('/getAll', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        const data = await NumberSeries.find().exec()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 
})

numberSeries.post('/getAvailable', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        const data = await NumberSeries.find({type:req.body.type,zone:req.body.zone}).sort({'detail.available':-1}).exec()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

numberSeries.post('/addSeries', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        const id_count = await NumberSeries.findOne().sort({ id: -1 }).exec()
        if(id_count === null){
            var idIncret = 1
        }else{
            var idIncret = id_count.id + 1
        }
        req.body.id = idIncret
        req.body.createDate = currentdateDash() 
        req.body.modifyDate = currentdateDash()
        const newStore = new NumberSeries(req.body)
        await newStore.save()
        res.status(200).json(newStore)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 
})

numberSeries.post('/editSeries', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {

        res.status(200).json({message:'wait for dev TT'})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 
})

module.exports = numberSeries
