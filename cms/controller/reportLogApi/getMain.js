const express = require('express')
require('../../configs/connect')
const {ErrorLog} = require("../../models/errorLog");
const reportLog = express.Router()
reportLog.get('/getAll', async (req, res) => {
    try {
        const data = await ErrorLog.find({},{_id:0,__v:0})
       res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

reportLog.get('/getError', async (req, res) => {
    try {
        const data = await ErrorLog.find({status:{$ne:'200'}},{_id:0,__v:0})
        res.status(200).json(data)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

reportLog.get('/getMain', async (req, res) => {
    try {
        const data = await ErrorLog.find({},{_id:0,__v:0})
        const groupedData = {};

// ใช้ Array.reduce() เพื่อแยกและนับข้อมูลตาม status
        data.reduce((acc, item) => {
            const { status, method, pathApi } = item;
            // ถ้าไม่มีกลุ่มสำหรับ status ใน groupedData ให้สร้างกลุ่มใหม่
            if (!acc[status]) {
                acc[status] = { count: 0, methods: {}, pathApis: {} };
            }
            // เพิ่มจำนวนการเกิดของ status ที่มี
            acc[status].count++;
            // นับ method
            if (!acc[status].methods[method]) {
                acc[status].methods[method] = 0;
            }
            acc[status].methods[method]++;
            // นับ pathApi
            if (!acc[status].pathApis[pathApi]) {
                acc[status].pathApis[pathApi] = 0;
            }
            acc[status].pathApis[pathApi]++;
            return acc;
        }, groupedData);

        console.log(groupedData);

        const groupedDataModified = {};
        const groupedDataModified2 = {};

        Object.keys(groupedData).forEach(status => {
            const paths = groupedData[status].pathApis;
            Object.keys(paths).forEach(pathApi => {
                groupedDataModified[pathApi] = { pathApi, count: paths[pathApi] };
            });
        });

        Object.keys(groupedData).forEach(status => {
            const meths = groupedData[status].methods;
            Object.keys(meths).forEach(methods => {
                groupedDataModified2[methods] = { methods, count: meths[methods] };
            });
        });

        console.log(Object.values(groupedDataModified2));

        // res.status(200).json({pathApi:Object.values(groupedDataModified),method:Object.values(groupedDataModified2)})
        res.status(200).json({groupedData})
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = reportLog