const express = require('express')
require('../../configs/connect')
const {Checkin} = require("../../models/route")
const getCheckIn = express.Router()

getCheckIn.post('/getAll', async(req, res) => {
    const data = await Checkin.find().exec()
    res.status(200).json(data)
})

module.exports = getCheckIn

