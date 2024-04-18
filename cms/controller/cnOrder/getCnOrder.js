const express = require('express')
require('../../configs/connect')
const {createLog} = require("../../services/errorLog")
const {CnOrder} = require("../../models/cnOrder");
const {errResponse} = require("../../services/errorResponse");
const getCnOrder = express.Router()
getCnOrder.get('/getAll', async (req, res) => {
    try {
        const data = await CnOrder.find()
        if(data.length > 0){
            await createLog('200', req.method, req.originalUrl, res.body, 'GetAll GiveProduct Successfully!')
            res.status(200).json(data)
        }else{
            await createLog('204', req.method, req.originalUrl, res.body, 'No Data')
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

getCnOrder.post('/getDetail', async (req, res) => {
    try {
        const data = await CnOrder.findOne({})
        if(data){
            await createLog('200', req.method, req.originalUrl, res.body, 'GetAll GiveProduct Successfully!')
            res.status(200).json(data)
        }else{
            await createLog('204', req.method, req.originalUrl, res.body, 'No Data')
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


module.exports = getCnOrder