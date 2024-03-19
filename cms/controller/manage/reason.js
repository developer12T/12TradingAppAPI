const express = require('express')
require('../../configs/connect')
const reasonManage = express.Router()
const {Reason} = require('../../models/reason.js')
const {ErrorLog} = require("../../models/errorLog");
const {currentdateDash} = require("../../utils/utility");
const { errResponse } = require('../../services/errorResponse')
const {createLog} = require("../../services/errorLog");
const _ = require("lodash");

reasonManage.get('/getAll', async (req, res) => {
    try {
            const data = await Reason.find({},{_id:0,__v:0,'list._id':0})
            if (data.length > 0){
                await createLog('200',req.method,req.originalUrl,res.body,'getDetail Store Succesfully')
                res.status(200).json(data)
            }else {
                await createLog('200',req.method,req.originalUrl,res.body,'No Data')
                await errResponse(res)
            }
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

reasonManage.post('/add', async (req, res) => {
    try {
                let { type } = req.body
                const data = await Reason.findOne({type:type})
                // console.log(data);
                if(data){
                    await createLog('200',req.method,req.originalUrl,res.body,'addReason Non-complete be`c type replace')
                    res.status(200).json({status:200,message:"type is Replace"})    
                    // res.status(200).json({data})    
                }else{
                    await Reason.create(req.body)
                    await createLog('200',req.method,req.originalUrl,res.body,'addReason Successfully')
                    res.status(200).json({status:200,message:"add Complete"})
                }
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

reasonManage.post('/update', async (req, res) => {
    try {
                let { type } = req.body
                // const data = await Reason.findOne({type:type})
                // console.log(data);
                    await Reason.deleteOne({type:type})
                    await Reason.create(req.body)
                    await createLog('200',req.method,req.originalUrl,res.body,'addReason Successfully')
                    res.status(200).json({status:200,message:"update Complete"})
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})


reasonManage.post('/getDetail', async (req, res) => {
    try {
            const data = await Reason.findOne(req.body,{_id:0,__v:0,'list._id':0})
            if (data){
                await createLog('200',req.method,req.originalUrl,res.body,'getDetail Store Succesfully')
                const resData = _.reverse(data.list)
                res.status(200).json(resData)
            }else {
                await createLog('200',req.method,req.originalUrl,res.body,'No Data')
                await errResponse(res)
            }
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = reasonManage

