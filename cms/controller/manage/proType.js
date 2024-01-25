const express = require('express')
require('../../configs/connect')
const {ProType} = require("../../models/promotion");
const {createLog} = require("../../services/errorLog");
const ProTypeManage = express.Router()

ProTypeManage.get('/getAll', async (req, res) => {
    try {
        const data = await ProType.find({}, {_id: 0, __v: 0})
        await createLog('200',req.method,req.originalUrl,res.body,'getAll ProType Successfully!')
        res.status(200).json(data)
    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
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
        await createLog('200',req.method,req.originalUrl,res.body,'addProType Successfully!')
        res.status(201).json({status: 201, message: 'Added ProType Successfully'})
    } catch (e) {
        console.log(e)
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = ProTypeManage