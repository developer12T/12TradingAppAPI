const express = require('express')
require('../../configs/connect')
const updateRoute = express.Router()
const _ = require('lodash')
const { Route } = require('../../models/route')

updateRoute.post('/updateListOrder', async (req, res) => {
    try {
        const { order, status, co } = req.body
        if (!order) {
            await createLog('501', req.method, req.originalUrl, res.body, 'require body')
            return res.status(501).json({ status: 501, message: 'require body' })
        }

        const updateFields = {
            'listCheck.$[elem].status': status
        }

        if (co) {
            updateFields.orderNo = co;
        }

        await Route.updateOne(
            { 'listCheck.orderId': order },
            { $set: updateFields },
            {
                arrayFilters: [{ 'elem.orderId': order }],
                new: true
            }
        )

        await createLog('200', req.method, req.originalUrl, res.body, 'Update Status Successfully')
        res.status(200).json({ status: 200, message: 'Update Status Successfully' })
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = updateRoute