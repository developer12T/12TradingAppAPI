
const express = require('express')
require('../../configs/connect')
const {Promotion} = require("../../models/promotion");
const getPromotion = express.Router()
getPromotion.post('/getPromotion', async (req, res) => {
    try {
        const data = await Promotion.find()
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getPromotion