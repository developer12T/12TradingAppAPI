const express = require('express')
require('../../configs/connect')
const getStore = express.Router()
const {Store, TypeStore} = require('../../models/store')
const {ErrorLog} = require("../../models/errorLog");
const {currentdateDash} = require("../../utils/utility");

getStore.post('/getAll', async (req, res) => {
    try {
        const data = await Store.find().sort({idNumber: 1}).exec()
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

getStore.post('/getStore', async (req, res) => {
    try {
        const data = await Store.find({ $or: [
                { status: '20' },
                { status: '90' },
                { status: '99' }
            ], area: req.body.area}, {
            _id: 0,
            storeId: 1,
            name: 1,
            route: 1,
            address: 1,
            distric: 1,
            subDistric: 1,
            province: 1
        }).sort({idNumber: 1,route:1}).exec()
        const mainData = []
        for (const list of data) {
            const newData = {
                storeId: list.storeId,
                name: list.name,
                route: list.route,
                address: list.address,
                distric: list.distric,
                subDistric: list.subDistric,
                province: list.province
            }
            mainData.push(newData)
        }

        res.status(200).json(mainData)

    } catch (error) {
        console.log(error)
        res.status(500).json(
            {
                status: 500,
                message: error.message
            })
    }
})

getStore.post('/getStoreNew', async (req, res) => {
    try {

        // const data = await Store.find({status:'0','approve.status':'1'}).sort({ idNumber: 1 }).exec()
        // const data = await Store.find({ status: '0', 'approve.status': { $ne: '2' } }).sort({ idNumber: 1 }).exec()
        const data = await Store.find({area: req.body.area,status:'19'}, {
            _id: 0,
            storeId: 1,
            name: 1,
            route: 1,
            status:1
        }).sort({idNumber: 1,route:1}).exec()

        data.forEach(item => {
            if (item.status === '19') {
                item.status = 'รออนุมัติ'
                console.log(item.status)
            } else if (item.status === '99') {
                item.status = 'ไม่อนุมัติ'
                console.log(item.status)
            } else if (item.status === '20') {
                item.status = 'อนุมัติแล้ว'
                console.log(item.status)
            }
        })
        const mainData = []
        for (const list of data) {
            const newData = {
                storeId: list.storeId,
                idStore: list.storeId,
                name: list.name,
                route: list.route,
                approved: list.status
            }
            mainData.push(newData)

        }
        res.status(200).json(mainData)

    } catch (error) {
        console.log(error)
        res.status(500).json({status:501,message:error.message})
    }
})

getStore.post('/getDetail', async (req, res) => {
    try {
        if (req.body.storeId !== '') {
            const data = await Store.findOne({storeId: req.body.storeId},
                {
                    _id: 0,
                    'approve._id': 0,
                    policyConsent: 0,
                    imageList: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                })
            const type = await TypeStore.findOne({id: data.type}, {})
            if (data.status === '19') {
                data.status = 'รออนุมัติ'

            } else if (data.status === '99') {
                data.status = 'ไม่อนุมัติ'

            } else if (data.status === '20') {
                data.status = 'อนุมัติแล้ว'

            }

            const newData = {
                storeId: data.storeId,
                name: data.name,
                taxId: data.taxId,
                tel: data.tel,
                route: data.route,
                type: type.name,
                address: data.address,
                distric: data.distric,
                subDistric: data.subDistric,
                province: data.province,
                provinceCode: data.provinceCode,
                zone: data.zone,
                area:data.area,
                latitude: data.latitude,
                longtitude: data.longtitude,
                lineId: data.lineId,
                approve: {
                    dateSend: data.approve.dateSend,
                    dateAction: data.approve.dateAction
                },
                status: data.status,
                createdDate: data.createdDate,
                updatedDate: data.updatedDate
            }
            res.status(200).json(newData)
        } else {
            res.status(501).json({status: 501, message: 'require body!'})
        }
    } catch (error) {
        // await ErrorLog.create({status:res.statusText,pathApi:req.path,dateCreate:currentdateDash(),message:error.stack})
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getStore

