const express = require('express')
require('../../../configs/connect')
const getNewStore = express.Router()
const {Store} = require('../../../models/store')
const {createLog} = require("../../../services/errorLog");

getNewStore.post('/getNew', async (req, res) => {
    const {currentdateDash} = require('../../../utils/utility.js')
    try {
        const data = await Store.find({'approve.status':'1'})
        await createLog('200',req.method,req.originalUrl,res.body,'getNew Store complete!')
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({status: 500, message: error.message})
    }
})

module.exports = getNewStore
