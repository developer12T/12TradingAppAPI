const express = require('express')
require('../../../configs/connect')
const {createLog} = require("../../../services/errorLog")
const {CnOrder, CartCn} = require("../../../models/cnOrder")
const {errResponse} = require("../../../services/errorResponse")
const getCartCn = express.Router()
getCartCn.get('/getCartCnAll', async (req, res) => {
    try {
        const data = await CartCn.find()
        if(data){
            await createLog('200', req.method, req.originalUrl, res.body, 'GetAll GiveProduct Successfully!')
            res.status(200).json(data)
        }else{
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            await errResponse(res)
        }
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})
getCartCn.post('/getCartCn', async (req, res) => {
    try {
        const data = await CartCn.findOne(req.body,{_id:0})
        if(data){
            await createLog('200', req.method, req.originalUrl, res.body, 'GetAll GiveProduct Successfully!')
            res.status(200).json(data)
        }else{
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            await errResponse(res)
        }
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getCartCn
