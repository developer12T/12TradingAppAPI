/*
 * Copyright (c) 2567. by develop 12Trading
 */
const express = require('express')
require('../../configs/connect')
const targetManage = express.Router()
const {createLog} = require("../../services/errorLog");
const {Target} = require("../../models/target");
const {errResponse} = require("../../services/errorResponse");
const {Cart} = require("../../models/saleProduct");

targetManage.get('/getAll', async (req, res) => {
    try {
        const data = await Target.find({}, {_id: 0, __v: 0, 'data._id': 0})
        if (data.length > 0) {
            await createLog('200', req.method, req.originalUrl, res.body, 'get target Successfully')
            res.status(200).json(data)
        } else {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            await errResponse(res)
        }
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

targetManage.post('/getDetail', async (req, res) => {
    try {
        const isYearMonthProvided = req.body.year !== undefined && req.body.month !== undefined

        if (!isYearMonthProvided) {
            await createLog('500', req.method, req.originalUrl, res.body, `require year and month. Received: year=${req.body.year}, month=${req.body.month}, area=${req.body.area}`)
            return res.status(200).json({status: 500, message: 'require year and month and area'})
        }

        const data = await Target.findOne(req.body, {_id: 0, __v: 0, 'data._id': 0})
        if (!data) {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            return await errResponse(res)
        }

        await createLog('200', req.method, req.originalUrl, res.body, 'get target Successfully')
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

targetManage.post('/addGrouped', async (req, res) => {
    try {
        const {year, month,area, data} = req.body
        const checkTarget = await Target.findOne({year, month,area})
        if (checkTarget) {
            res.status(200).json({status: 200, message: `already have this year:${year} and month:${month} and area:${area}`})
        } else {
            await Target.create(req.body)
            await createLog('200', req.method, req.originalUrl, res.body, 'add target Successfully')
            res.status(200).json({status: 200, message: 'add target Successfully'})
        }
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

targetManage.put('/update', async (req, res) => {
    try {
        let isYearMonthProvided
        isYearMonthProvided = req.body.year !== undefined && req.body.month !== undefined

        if (!isYearMonthProvided) {
            await createLog('500', req.method, req.originalUrl, res.body, `require year and month. Received: year=${req.body.year}, month=${req.body.month}, area=${req.body.area}`)
            return res.status(200).json({status: 500, message: 'require year and month'})
        }

        const data = await Target.findOne({year: req.body.year, month: req.body.month,area:req.body.area}, {_id: 0, __v: 0, 'data._id': 0})
        if (!data) {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            return await errResponse(res)
        }

        await Target.updateOne({
            year: req.body.year,
            month: req.body.month,
            area: req.body.area,
            data: {
                $elemMatch: {
                    id: req.body.id,
                }
            }
        }, {
            $set: {
                'data.$.name': req.body.name,
                'data.$.targetMarket': req.body.targetMarket,
                'data.$.targetQty': req.body.targetQty,
                'data.$.unit': req.body.unit,
                'data.$.list': req.body.list,
            }
        })

        await createLog('200', req.method, req.originalUrl, res.body, 'Update Target Successfully')
        res.status(200).json({status:200,message:'update data complete'})
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = targetManage

