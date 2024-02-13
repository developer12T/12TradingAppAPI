/*
 * Copyright (c) 2567. by develop 12Trading
 */
const express = require('express')
require('../../configs/connect')
const targetManage = express.Router()
const {createLog} = require("../../services/errorLog");

targetManage.post('/getAll', async (req, res) => {
    try {
        const data = {
            year: '2024',
            data: [{
                id: 1,
                name: 'กลุ่ม 1',
                list: [
                    {group: 'ผงปรุงรส'},
                    {group: 'น้ำจิ้มไก่'}
                ]
            }, {
                id: 2,
                name: 'กลุ่ม 2',
                list: [
                    {group: 'น้ำมะนาว'},
                    {group: 'มะนาวผง'}
                ]
            }]
        }
        await createLog('200', req.method, req.originalUrl, res.body, 'get target Successfully')
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = targetManage

