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

updateCnOrder.post('/UpdateQtyCnOrder', async (req, res) => {
    try {
        const { orderNo, itemNo, unit, oldLot, qty, lot } = req.body;
        
        if (!orderNo || !itemNo || qty == null) {
            await createLog('501', req.method, req.originalUrl, req.body, 'require body');
            return res.status(501).json({ status: 501, message: 'require body' });
        }

        const cnOrder = await CnOrder.findOne({ orderNo: orderNo });
        
        if (!cnOrder) {
            await createLog('404', req.method, req.originalUrl, req.body, 'Order not found');
            return res.status(404).json({ status: 404, message: 'Order not found' });
        }

        const item = cnOrder.list.find(i => i.id === itemNo && i.lot === oldLot && i.unitQty === unit);

        if (!item) {
            await createLog('404', req.method, req.originalUrl, req.body, 'Item not found');
            return res.status(404).json({ status: 404, message: 'Item not found' });
        }

        item.qty = qty;
        item.amount = parseFloat((qty * item.pricePerQty).toFixed(2));
        item.lot = lot;

        cnOrder.totalAmount = parseFloat(cnOrder.list.reduce((sum, i) => sum + i.amount, 0).toFixed(2));
        
        await CnOrder.updateOne({ orderNo: orderNo }, { $set: { list: cnOrder.list, totalAmount: cnOrder.totalAmount, updateDate: currentdateDash() } });

        await createLog('200', req.method, req.originalUrl, req.body, 'Update Quantity Successfully');
        res.status(200).json({ status: 200, message: 'Update Quantity Successfully' });
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, req.body, e.message);
        res.status(500).json({
            status: 500,
            message: e.message
        });
    }
});

module.exports = updateCnOrder