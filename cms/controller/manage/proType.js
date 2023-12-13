const express = require('express')
require('../../configs/connect')
const {ProType} = require("../../models/promotion");
const ProTypeManage = express.Router()

ProTypeManage.get('/getAll', async (req, res) => {
    try {
        const data = await ProType.find({}, {_id: 0, __v: 0})
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

ProTypeManage.post('/addProType', async (req, res) => {
    try {
        const {currentdateDash} = require('../../utils/utility')
        req.body.createDate = currentdateDash()
        req.body.updateDate = '****-**-**T**-**-**'
        await ProType.create(req.body)
        res.status(201).json({status: 201, message: 'Added ProType Successfully'})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = ProTypeManage