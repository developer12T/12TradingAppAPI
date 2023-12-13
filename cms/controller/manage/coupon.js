const express = require('express')
require('../../configs/connect')
const {ProType, Coupon} = require("../../models/promotion");
const {currentdateDash} = require("../../utils/utility");
const CouponManage = express.Router()

CouponManage.get('/getAll', async (req, res) => {
    try {
        const data = await Coupon.find({}, {_id: 0, __v: 0})
        res.status(200).json(data)
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

CouponManage.post('/generateCoupon', async (req, res) => {
    try {
       // await
        res.status(200).json({status:201,message:'Generate '})
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = CouponManage