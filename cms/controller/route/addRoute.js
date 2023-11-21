const express = require('express')

require('../../configs/connect')
const addRoute = express.Router()
const {Route, Checkin} = require('../../models/route')

addRoute.post('/newRoute', async (req, res) => {
    try {
        const newRoute = new Route(req.body)
        await newRoute.save()
        res.status(200).json('add route --')
    } catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = addRoute