const express = require('express')
require('../../configs/connect')
const {ProType, Coupon} = require("../../models/promotion");
const {currentdateDash} = require("../../utils/utility");
const {createLog} = require("../../services/errorLog");
const CouponManage = express.Router()

CouponManage.get('/getAll', async (req, res) => {
    try {
        const data = await Coupon.find({}, {_id: 0, __v: 0})
        await createLog('200',req.method,req.originalUrl,res.body,'GetAll Coupon Successfully!')
        res.status(200).json(data)
    } catch (e) {
        await createLog('200',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

CouponManage.post('/generateCoupon', async (req, res) => {
    try {
       // await

        await createLog('200',req.method,req.originalUrl,res.body,'GenerateCoupon Coupon Successfully!')
        res.status(200).json({status:201,message:'Generate '})
    } catch (e) {
        await createLog('200',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = CouponManage