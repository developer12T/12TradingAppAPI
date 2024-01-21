const express = require('express')
require('../../configs/connect')
const _ = require("lodash");
const {GiveProduct} = require("../../models/giveProduct");
const getGiveProduct = express.Router()
getGiveProduct.post('/getAll', async (req, res) => {
    try {
        const data = await GiveProduct.find()
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getGiveProduct