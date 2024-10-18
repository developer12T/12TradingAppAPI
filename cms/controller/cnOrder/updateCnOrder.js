const express = require('express')

require('../../configs/connect')
const { CnOrder } = require("../../models/cnOrder")
const { createLog } = require("../../services/errorLog")
const { currentdateDash } = require('../../utils/utility.js')
const updateCnOrder = express.Router()

updateCnOrder.post('/UpdateCnOrder', async (req, res) => {
    try {
        const { order, status, co } = req.body
        if (!order) {
            await createLog('501', req.method, req.originalUrl, res.body, 'require body')
            res.status(501).json({ status: 501, message: 'require body' })
        } else {
            const updateFields = { status: status, updateDate: currentdateDash() }
            if (co) {
                updateFields.orderNo = co
            }
            await CnOrder.updateOne({ orderNo: order }, { $set: updateFields })
            
            await createLog('200', req.method, req.originalUrl, res.body, 'update Status Successfully')
            res.status(200).json({ status: 200, message: 'Update Status Successfully' })
        }
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = updateCnOrder