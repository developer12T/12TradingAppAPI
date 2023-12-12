const express = require('express')
require('../../configs/connect')
const {Promotion} = require("../../models/promotion");
const addPromotion = express.Router()
addPromotion.post('/addPromotion', async (req, res) => {
    try {
        const data = await Promotion.find()

        res.status(200).json({
            status: 201,
            message: 'addPromotion',
            additionalData:data
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})


module.exports = addPromotion