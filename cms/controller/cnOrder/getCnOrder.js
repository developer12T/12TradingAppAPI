const express = require('express')
require('../../configs/connect')
const {createLog} = require("../../services/errorLog")
const {CnOrder} = require("../../models/cnOrder");
const {errResponse} = require("../../services/errorResponse");
const getCnOrder = express.Router()
getCnOrder.get('/getAll', async (req, res) => {
    try {
        const data = await CnOrder.find()
        if(data){
            await createLog('200', req.method, req.originalUrl, res.body, 'GetAll GiveProduct Successfully!')
            res.status(200).json(data)
        }else{
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
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

getCnOrder.get('/testrunfile', async (req, res) => {
    try {
        const fs = require('fs');

        const filePath = 'number.txt';

        for (let i = 0; i < 1000000000; i++) {
            const formattedNumber = `${i.toString().padStart(10, '0')}\n`;
            fs.appendFileSync(filePath, formattedNumber, 'utf8');
        }

        console.log('File created successfully.');

        res.status(200).json('complete')
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