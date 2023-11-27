const express = require('express')
require('../../configs/connect')
const statusDesManage = express.Router()
const { statusDes } = require('../../models/statusDes')

statusDesManage.post('/getAll', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        const data = await statusDes.find().exec();
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})

module.exports = statusDesManage

