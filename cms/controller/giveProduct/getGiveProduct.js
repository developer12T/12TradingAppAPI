const express = require('express')
require('../../configs/connect')
const _ = require("lodash");
const {GiveProduct} = require("../../models/giveProduct");
const {statusDes} = require("../../models/statusDes");
const {createLog} = require("../../services/errorLog");
const getGiveProduct = express.Router()
getGiveProduct.post('/getAll', async (req, res) => {
    try {
        const data = await GiveProduct.find()
        await createLog('200', req.method, req.originalUrl, res.body, 'GetAll GiveProduct Successfully!')
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getGiveProduct.post('/getMain', async (req, res) => {
    try {
        let data = await GiveProduct.find({area: req.body.area, status: {$ne: '11'}}, {
            _id: 0,
            createDate: 1,
            status: 1,
            type: 1,
            id: 1
        })
        const showData = []
        for (const mainData of data) {
            let dataStatus = await statusDes.findOne({
                type: 'giveProduct',
                list: {$elemMatch: {id: mainData.status}}
            }, {'list.$': 1})
            mainData.status = dataStatus.list[0].name
            showData.push(mainData)
        }
        await createLog('200', req.method, req.originalUrl, res.body, 'GetMain GiveProduct Successfully!')
        res.status(200).json(showData)
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getGiveProduct