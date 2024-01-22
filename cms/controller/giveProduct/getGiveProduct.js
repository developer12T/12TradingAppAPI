const express = require('express')
require('../../configs/connect')
const _ = require("lodash");
const {GiveProduct} = require("../../models/giveProduct");
const {statusDes} = require("../../models/statusDes");
const getGiveProduct = express.Router()
getGiveProduct.post('/getAll', async (req, res) => {
    try {
        const data = await GiveProduct.find()
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getGiveProduct.post('/getMain', async (req, res) => {
    try {
        let data = await GiveProduct.find(req.body, {_id: 0, createDate: 1, status: 1, type: 1, id: 1})
        const showData = []
        for(const mainData of data){
            let dataStatus = await statusDes.findOne({type: 'giveProduct', list: { $elemMatch: {id:mainData.status}}}, {'list.$': 1})
            mainData.status = dataStatus.list[0].name
            showData.push(mainData)
        }
        res.status(200).json(showData)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getGiveProduct