const express = require('express')

require('../../configs/connect')
const saleLogin = express.Router()
const {Route, Checkin} = require('../../models/route')
const {User} = require("../../models/user");

saleLogin.post('/login', async (req, res) => {
    try {
        const data = await User.findOne()
        res.status(200).json(data)

    } catch (e) {
        res.status(500).json(e.message)
    }
})

module.exports = saleLogin
