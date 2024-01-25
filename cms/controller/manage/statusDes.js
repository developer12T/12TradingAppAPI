const express = require('express')
require('../../configs/connect')
const statusDesManage = express.Router()
const { statusDes } = require('../../models/statusDes')
const {Product} = require("../../models/product");
const {createLog} = require("../../services/errorLog");

statusDesManage.post('/getAll', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {

        const idInsert = await statusDes.findOne({}, {_id: 0, id: 1}).sort({id: -1})
        if (idInsert === null) {
            var idIndex = 1
        } else {
            var idIndex = idInsert.id + 1
        }

        req.body.id = idIndex
        req.body.status = 1
        req.body.modifyDate = '****-**-**T**:**'
        req.body.createDate = currentdateDash()

        await statusDes.create(req.body)
        await createLog('200',req.method,req.originalUrl,res.body,'Add StatusDes Successfully')
        res.status(200).json({status:201,message:'Add StatusDes Successfully'})
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})

module.exports = statusDesManage

