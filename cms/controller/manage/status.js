const express = require('express')
require('../../configs/connect.js')
const statusManage = express.Router()
const { status } = require('../../models/status')
const { Product } = require("../../models/product.js");
const { createLog } = require("../../services/errorLog.js");

statusManage.post('/getAll', async (req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {

        const idInsert = await status.findOne({}, { _id: 0, id: 1 }).sort({ id: -1 })
        if (idInsert === null) {
            var idIndex = 1
        } else {
            var idIndex = idInsert.id + 1
        }

        req.body.id = idIndex
        req.body.status = 1
        req.body.modifyDate = '****-**-**T**:**'
        req.body.createDate = currentdateDash()

        await status.create(req.body)
        await createLog('200', req.method, req.originalUrl, res.body, 'Add Status Successfully')
        res.status(200).json({ status: 201, message: 'Add Status Successfully' })
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = statusManage

