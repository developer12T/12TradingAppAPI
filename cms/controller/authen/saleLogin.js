const express = require('express')

require('../../configs/connect')
const saleLogin = express.Router()
const {Route, Checkin} = require('../../models/route')

saleLogin.post('/login', async (req, res) => {
    try {
        res.status(200).json('test login --')
    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = saleLogin