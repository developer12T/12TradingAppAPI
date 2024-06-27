const express = require('express')
require('../../configs/connect')
const {createLog} = require("../../services/errorLog")
const {CnOrder} = require("../../models/cnOrder")
const {errResponse} = require("../../services/errorResponse")
const {getNameStatus} = require("../../utils/utility")
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

getCnOrder.post('/getMain', async (req, res) => {
    try {
        const { area } = req.body
        const data = await CnOrder.find({area},{_id:0,__v:0,idIndex:0}).sort({id:-1})
        if(data.length > 0){
            const mainData = []
            for(let list of data){
                // const nameSt = await statusDes.findOne({type:"order",list: {$elemMatch:{'id':list.status}}},{list:1})
                mainData.push({
                    orderDate:list.createDate,
                    number:list.orderNo,
                    name:list.storeName,
                    totalPrice:list.totalPrice,
                    status:list.status,
                    statusText: (await getNameStatus('cn', list.status)).name
                })
            }
            console.log(mainData);
            await createLog('200',req.method,req.originalUrl,res.body,'getAll Order Successfully!')
            res.status(200).json(mainData)
        }else{
            await createLog('204',req.method,req.originalUrl,res.body,'No Data')
            res.status(200).json({status:204,message:'No Data'})
        }
    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
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