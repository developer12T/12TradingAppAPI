const express = require('express')

require('../../configs/connect')
const getRoute = express.Router()
const {Route, Checkin} = require('../../models/route')
const {currentdateDash} = require("../../utils/utility");
const {Store} = require("../../models/store");

getRoute.get('/getAll', async (req, res) => {
    try {
        const data = await Route.find().exec()
        res.status(200).json(data)

    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = getRoute