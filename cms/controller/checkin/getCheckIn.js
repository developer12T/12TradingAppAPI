const express = require('express')
require('../../configs/connect')
const {Checkin} = require("../../models/route")
const getCheckIn = express.Router()

getCheckIn.post('/getAll', async (req, res) => {
    const data = await Checkin.find().exec()
    res.status(200).json(data)
})

getCheckIn.post('/getVisitDetail', async (req, res) => {
    const data = await Checkin.findOne({id:req.body.id}, {'_id': 0, 'detail': {$elemMatch: {'storeId': req.body.storeId}}}).exec()
    res.status(200).json(data.detail)
})

module.exports = getCheckIn

