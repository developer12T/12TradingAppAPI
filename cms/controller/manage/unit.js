const express = require('express')
require('../../configs/connect')
const {Unit, Product} = require("../../models/product");
const {currentdateDash} = require("../../utils/utility");
const axios = require("axios");
const unitManage = express.Router()


unitManage.post('/getUnit', async(req, res) => {
    try {

        const data = await Unit.find({},{_id:0,__v:0})

        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

unitManage.post('/getDetail', async(req, res) => {
    try {
        const data = await Unit.findOne({},{_id:0,__v:0,createDate:0,updateDate:0})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})
unitManage.post('/addUnit', async(req, res) => {
    try {
        const { currentdateDash } = require('../../utils/utility.js')
        const idUn = await Unit.findOne({}).sort({idUnit:-1}).exec()
        if(!idUn){var idIn = 1}else{var idIn = idUn.idUnit+1}
        req.body.idUnit = idIn
        req.body.createDate = currentdateDash()
        req.body.updateDate = '****-**-**T**:**'
        await Unit.create(req.body)
        res.status(200).json({status:201,message:'Add New Unit Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

unitManage.post('/addUnitFromM3', async(req, res) => {
    try {
        const response = await axios.post('http://58.181.206.159:9814/cms_api/cms_unit.php')
        for(let i = 0 ;i <  response.data.length ;i++){
            response.data[i].createDate = currentdateDash()
            response.data[i].updateDate = '****-**-**T**:**'
            await Unit.create(response.data[i])
        }
        res.status(200).json(response.data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

unitManage.post('/updateUnit', async(req, res) => {
    try {
        const { currentdateDash } = require('../../utils/utility.js')
        await Unit.updateOne({idUnit:req.body.idUnit} , {nameThai:req.body.nameThai,nameEng:req.body.nameEng,updateDate:currentdateDash()})
        res.status(200).json({status:201,message:'Update Unit Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

module.exports = unitManage

