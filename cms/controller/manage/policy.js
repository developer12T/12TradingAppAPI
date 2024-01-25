const express = require('express')
require('../../configs/connect')
const {Policy} = require("../../models/policy")
const {createLog} = require("../../services/errorLog");
const policyManage = express.Router()

policyManage.post('/addPolicy', async (req, res) => {
    try {

        const idA = await Policy.findOne({},{id:1}).sort({id:-1})
        if(!idA){
            var idIn = 1
        }else{
            var idIn = idA.id +1
        }

        const mainData = {
            id:idIn,
            list:req.body.list
        }
        await Policy.create(mainData)
        await createLog('200',req.method,req.originalUrl,res.body,'addPolicy Successfully!')
        res.json({
            status: 200,
            message: 'Policy added successfully'
        });
    } catch (error) {
        console.error(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

policyManage.post('/getPolicy', async (req, res) => {
    try {
        const data = await Policy.findOne({id:req.body.id})
        await createLog('200',req.method,req.originalUrl,res.body,'getPolicy Successfully!')
        res.status(200).json(data.list)
    } catch (error) {
        console.error(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = policyManage;
