const express = require('express')
require('../../configs/connect')
const getStore = express.Router()
const {Store} = require('../../models/store')

getStore.post('/getAll', async (req, res) => {
    try {
        const data = await Store.find().sort({idNumber: 1}).exec()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json(error.message)
    }
})

getStore.post('/getWithCondition', async (req, res) => {
    try {
        if (req.body.tab === 'new') {
            // const data = await Store.find({status:'0','approve.status':'1'}).sort({ idNumber: 1 }).exec()
            // const data = await Store.find({ status: '0', 'approve.status': { $ne: '2' } }).sort({ idNumber: 1 }).exec()
            const data = await Store.find({zone:req.body.zone}, {
                _id: 0,
                idCharecter: 1,
                idNumber: 1,
                name: 1,
                route: 1,
               'approve.status':1
            }).sort({idNumber: -1}).exec()

            data.forEach(item => {
                if (item.approve.status === '1') {
                    item.approve.status = 'รออนุมัติ'
                    console.log(item.approve.status)
                }else if(item.approve.status === '0'){
                    item.approve.status = 'ไม่อนุมัติ'
                    console.log(item.approve.status)
                }else if(item.approve.status === '2'){
                    item.approve.status = 'อนุมัติแล้ว'
                    console.log(item.approve.status)
                }
            })
            const mainData = []
            for(const list of data){
                const newData = {
                    idCharecter: list.idCharecter,
                    idNumber: list.idNumber,
                    idStore:list.idCharecter + list.idNumber,
                    name: list.name,
                    route: list.route,
                    approve:list.approve
                }
                mainData.push(newData)

            }
            res.status(200).json(mainData)
        } else if (req.body.tab === 'all') {
            const data = await Store.find({status: '1', 'approve.status': '2',zone:req.body.zone}, {
                _id: 0,
                idCharecter: 1,
                idNumber: 1,
                name: 1,
                route: 1,
                addressTitle: 1,
                distric: 1,
                subDistric: 1,
                province: 1
            }).sort({idNumber: 1}).exec()
            const mainData = []
            for(const list of data){
                const newData = {
                    idCharecter: list.idCharecter,
                    idNumber: list.idNumber,
                    idStore:list.idCharecter + list.idNumber,
                    name: list.name,
                    route: list.route,
                    addressTitle: list.addressTitle,
                    distric: list.distric,
                    subDistric: list.subDistric,
                    province: list.province
                }
                mainData.push(newData)

            }

            res.status(200).json(mainData)
        } else {
            res.status(501).json({message: 'empty tab!'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error.message)
    }
})

getStore.post('/getDetail', async (req, res) => {
    try {
        if (req.body.id !== '' && req.body.id !== undefined) {
            const data = await Store.findOne({idNumber: req.body.id,idNumber:req.body.idC},
                {
                    _id: 0,
                    'approve._id': 0,
                    policyConsent: 0,
                    imageList: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                }).sort({idNumber: -1}).exec()

            const newData = {
                idCharecter: data.idCharecter,
                idNumber: data.idNumber,
                name: data.name,
                taxId: data.taxId,
                tel: data.tel,
                route: data.route,
                type: data.type,
                addressTitle:data.addressTitle,
                distric: data.distric,
                subDistric: data.subDistric,
                province: data.province,
                provinceCode: data.provinceCode,
                zone: data.zone,
                latitude: data.latitude,
                longtitude: data.longtitude,
                lineId: data.lineId,
                approve: {
                    status:data.approve.status,
                    dateSend: data.approve.dateSend,
                    dateAction: data.approve.dateAction
                },
                status: data.status,
                createdDate: data.createdDate,
                updatedDate: data.updatedDate
            }
            res.status(200).json(newData)
        } else {
            res.status(501).json({message: 'require body!'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error.message)
    }
})

module.exports = getStore

