const express = require('express')
require('../../configs/connect')
const {Promotion, ProType} = require("../../models/promotion");
const {Store, TypeStore} = require("../../models/store");
const _ = require("lodash");
const optionData = express.Router()
optionData.post('/getProType', async (req, res) => {
    try {
        const data = await ProType.find()
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

optionData.post('/getStore', async (req, res) => {
    try {
        const data = await Store.find({},{storeId:1,name:1,_id:0})
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

optionData.post('/getTypeStore', async (req, res) => {
    try {
        const data = await TypeStore.find({},{id:1,_id:0,name:1})
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

optionData.post('/getZoneStore', async (req, res) => {
    try {
        const data = await Store.find({},{_id:0,zone:1})
        const data_arr =[]
        for(const list of data){
            data_arr.push(list.zone)
        }
        const listData = _.uniq(data_arr)
        res.status(200).json({zone:listData})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

optionData.post('/getAreaStore', async (req, res) => {
    try {
        const data = await Store.find({},{_id:0,area:1}).sort({area:1})
        const data_arr =[]
        for(const list of data){
            data_arr.push(list.area)
        }
        const listData = _.uniq(data_arr)
        res.status(200).json({zone:listData})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

optionData.post('/getExceptPro', async (req, res) => {
    try {
        const data = await Promotion.find()
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})




module.exports = optionData