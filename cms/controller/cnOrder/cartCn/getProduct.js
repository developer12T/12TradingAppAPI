const express = require('express')
// require('../../configs/connect')
require('../../../configs/connect')
const getProductCn = express.Router()
const axios = require('axios')
const _ = require('lodash')
const {createLog} = require("../../../services/errorLog");
const {errResponse} = require("../../../services/errorResponse");

getProductCn.post('/getProductCn', async (req, res) => {
    try {
        const data = await axios.post(process.env.API_URL_IN_USE+'/cms/saleProduct/getProductAll',{})
        console.log(data.data)
        if(data.data.length > 0){
            const responseData = []
            await createLog('200',req.method,req.originalUrl,res.body,'getProductCn successfully')
            res.status(200).json(data.data)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'No Data')
            await errResponse(res)
        }
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json(error.message)
    }
})

getProductCn.post('/getProductCnDetail', async (req, res) => {
    try {
        const data = await axios.post(process.env.API_URL_IN_USE+'/cms/saleProduct/getProductDetail',req.body)
        console.log(data.data)
        if(data.data){
            const responseData = []
            await createLog('200',req.method,req.originalUrl,res.body,'getProductCnDetail successfully')
            res.status(200).json(data.data)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'No Data')
            await errResponse(res)
        }
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json(error.message)
    }
})

getProductCn.post('/getProductCnDetailUnit', async (req, res) => {
    try {
        const data = await axios.post(process.env.API_URL_IN_USE+'/cms/saleProduct/getProductDetailUnit',req.body)
        console.log(data.data)
        if(data.data){
            const responseData = []
            await createLog('200',req.method,req.originalUrl,res.body,'getProductCnDetailUnit successfully')
            res.status(200).json(data.data)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'No Data')
            await errResponse(res)
        }
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json(error.message)
    }
})

module.exports = getProductCn