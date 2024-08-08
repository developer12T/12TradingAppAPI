const express = require('express')
require('../../configs/connect')
const getStore = express.Router()
const { Store, TypeStore } = require('../../models/store')
const { User } = require('../../models/user')
const { ErrorLog } = require("../../models/errorLog")
const { convertDateFormat, convertFormatErp } = require("../../utils/utility")
const { errResponse } = require('../../services/errorResponse')
const { createLog } = require("../../services/errorLog")

getStore.post('/getAll', async (req, res) => {
    try {
        const data = await Store.find({}, { _id: 0, 'approve._id': 0, 'policyConsent._id': 0 }).sort({ storeId: 1 }).exec()
        await createLog('200', req.method, req.originalUrl, res.body, 'getAll Store Succesfully')
        res.status(200).json(data)
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

getStore.post('/getStore', async (req, res) => {
    try {
        const data = await Store.find({
            $or: [
                { status: '20' },
                { status: '90' },
                { status: '99' }
            ], area: req.body.area
        }, {
            _id: 0,
            storeId: 1,
            name: 1,
            route: 1,
            address: 1,
            district: 1,
            subDistrict: 1,
            province: 1
        }).sort({ idNumber: 1, route: 1 }).exec()
        if (data.length > 0) {
            const mainData = []
            for (const list of data) {
                const newData = {
                    storeId: list.storeId,
                    name: list.name,
                    route: list.route,
                    address: list.address,
                    district: list.district,
                    subDistrict: list.subDistrict,
                    province: list.province
                }
                mainData.push(newData)
            }
            await createLog('200', req.method, req.originalUrl, res.body, 'getStore Succesfully')
            res.status(200).json(mainData)
        } else {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            await errResponse(res)
        }
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json(
            {
                status: 500,
                message: error.message
            })
    }
})

getStore.post('/getStoreNew', async (req, res) => {
    try {
        const { area } = req.body;
        
        const currentMonth = new Date().getMonth() + 1; 
        const currentYear = new Date().getFullYear();

        const data = await Store.aggregate([
            {
                $match: {
                    area: area,
                    status: { $in: ['10', '15'] }
                }
            },
            {
                $addFields: {
                    createdDateConverted: { $toDate: "$createdDate" }
                }
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$createdDateConverted" }, currentMonth] },
                            { $eq: [{ $year: "$createdDateConverted" }, currentYear] }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    storeId: 1,
                    area: 1,
                    name: 1,
                    route: 1,
                    status: 1,
                    createdDate: 1
                }
            },
            {
                $sort: { idNumber: 1, route: 1 }
            }
        ]);

        if (data.length > 0) {
            data.forEach(item => {
                if (item.status === '10') {
                    item.statusText = 'รออนุมัติ';
                } else if (item.status === '15') {
                    item.statusText = 'อนุมัติ';
                }
            });

            const mainData = [];
            for (const list of data) {
                const idRoute = `${list.area}${list.route}`;
                const day = 'Day ' + list.route.slice(-2);
                const newData = {
                    storeId: list.storeId,
                    idRoute: idRoute,
                    name: list.name,
                    route: list.route,
                    day: day,
                    status: list.status,
                    approvedText: list.statusText,
                    created: convertDateFormat(list.createdDate)
                };
                mainData.push(newData);
            }
            await createLog('200', req.method, req.originalUrl, res.body, 'getStoreNew Successfully');
            res.status(200).json(mainData);
        } else {
            await createLog('204', req.method, req.originalUrl, res.body, 'No Data');
            await errResponse(res);
        }
    } catch (error) {
        console.log(error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({ status: 501, message: error.message });
    }
});

getStore.post('/getDetail', async (req, res) => {
    try {
        if (req.body.storeId !== '') {
            const data = await Store.findOne({ storeId: req.body.storeId },
                {
                    _id: 0,
                    'approve._id': 0,
                    policyConsent: 0,
                    imageList: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0
                })
            if (data) {
                const type = await TypeStore.findOne({ id: data.type }, {})
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
                    district: data.district,
                    subDistrict: data.subDistrict,
                    province: data.province,
                    provinceCode: data.provinceCode,
                    zone: data.zone,
                    area: data.area,
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
                await createLog('200', req.method, req.originalUrl, res.body, 'getDetail Store Succesfully')
                res.status(200).json(newData)
            } else {
                await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
                await errResponse(res)
            }
        } else {
            await createLog('501', req.method, req.originalUrl, res.body, 'require body!')
            res.status(501).json({ status: 501, message: 'require body!' })
        }
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

getStore.post('/getStoreNewtoM3', async (req, res) => {
    try {
        const data = await Store.find({ status: '10' }, {_id: 0,}).sort({ storeId: 1}).exec()
        if (data.length > 0) {
            const dataUser = await User.find({ }, {
                _id: 0,
                saleCode: 1,
                salePayer: 1,
                area: 1
            });
            const mainData = []
            for (const list of data) {
                const matchedUser = dataUser.find(item => item.area === list.area);
                const saleCode = matchedUser ? matchedUser.saleCode : null;
                const salePayer = matchedUser ? matchedUser.salePayer : null;
                const idRoute = `${list.area}${list.route}`;
                const day = 'Day '+list.route.slice(-2);
                const newData = {
                    storeId: list.storeId,
                    name: list.name,
                    route: list.route,
                    type: list.type,
                    tel: list.tel,
                    taxId: list.taxId,
                    address1: list.address,
                    address2: list.district+' '+list.subDistrict,
                    address3: list.province,
                    provinceCode: list.provinceCode,
                    postCode: list.postCode,
                    town: list.district,
                    area: list.area,
                    zone: list.zone,
                    saleCode: saleCode,
                    salePayer: salePayer,
                    lat: list.latitude,
                    long: list.longtitude,
                    channel: '110',
                    note: list.note && list.note.trim() !== '' ? list.note : '-',
                    created: convertFormatErp(list.createdDate)
                }
                mainData.push(newData)

            }
            await createLog('200', req.method, req.originalUrl, res.body, 'getStoreNew Succesfully')
            res.status(200).json(mainData)
        } else {
            await createLog('204', req.method, req.originalUrl, res.body, 'No Data')
            await errResponse(res)
        }
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({ status: 501, message: error.message })
    }
})

module.exports = getStore

