const express = require('express')
require('../../configs/connect')
const {Checkin} = require("../../models/route")
const getCheckIn = express.Router()

getCheckIn.post('/getAll', async (req, res) => {
    try {
        const data = await Checkin.find().exec()
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json(e.message)
    }
})

getCheckIn.post('/getVisitDetail', async (req, res) => {
    try {
        const data = await Checkin.findOne({id: req.body.id}, {
            '_id': 0,
            'detail': {$elemMatch: {'storeId': req.body.storeId}}
        }).exec()
        res.status(200).json(data.detail)
    } catch (e) {
        res.status(500).json(e.message)
    }
})

module.exports = getCheckIn

