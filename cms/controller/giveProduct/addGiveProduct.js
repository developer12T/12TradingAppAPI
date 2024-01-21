const express = require('express')
require('../../configs/connect')
const _ = require("lodash");
const {GiveProduct} = require("../../models/giveProduct");
const addGiveProduct = express.Router()
addGiveProduct.post('/add', async (req, res) => {
    try {
        const { currentdateDash  } = require('../../utils/utility')
        const approve = {
            dateSend: currentdateDash(),
            dateAction: null,
            appPerson: null
        }
        req.body.approve = approve
        req.body.updateDate = null
        req.body.createDate = currentdateDash()
        await GiveProduct.create(req.body)
        res.status(200).json({status:200,message:'Add GiveProduct Successfully!'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = addGiveProduct