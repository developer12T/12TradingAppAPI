const express = require('express')
require('../../configs/connect')
const getRoute = express.Router()
const _ = require('lodash')
const { Route, Checkin } = require('../../models/route')
const { Store} = require("../../models/store")
const { statusDes} = require("../../models/statusDes")
const { errResponse } = require('../../services/errorResponse')
const { checkDistanceLatLon } = require("../../utils/utility")
const { createLog } = require("../../services/errorLog")
getRoute.get('/getAll', async (req, res) => {
    try {
        const data = await Route.find().exec()
        await createLog('200',req.method,req.originalUrl,res.body,'Get All Route Data complete')
        res.status(200).json(data)

    } catch (e) {
        await createLog('500',res.method,req.originalUrl,res.e,error.stack)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getRoute.post('/getRouteMain', async (req, res) => {
    try {
        const showData = []
        let statusCount = 0
        let statusBlack = 0
        const data = await Route.find({area:req.body.area}, {_id: 0}).exec()
        // console.log(data)
        if(data.length > 0){
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].list.length; j++) {
                    statusCount += (data[i].list[j].status === '1') ? 1 : 0;
                    statusBlack = data[i].list.length
                }
                const day = (i + 1 < 10) ? '0' + (i + 1) : (i + 1)
                let descript =
                    (statusCount < statusBlack && statusCount !== 0) ? 'processing' :
                        statusCount === statusBlack ? 'success' :
                            statusBlack === 0 ? 'pending' :
                                'progress'

                    let descript2 =
                                (statusCount < statusBlack && statusCount !== 0) ? '1' :
                                    statusCount === statusBlack ? '2' :
                                        statusBlack === 0 ? '-1' :
                                            '0'
                    
                const showData_obj = {
                    id: data[i].id,
                    day: 'Day ' + day,
                    route: i + 1,
                    statusNumber: statusCount + '/' + statusBlack,
                    statusText: descript,
                    status:descript2
                }
                showData.push(showData_obj)
                statusCount = 0
            }
            await createLog('200',req.method,req.originalUrl,res.body,'GetRouteMain Data complete')
            res.status(200).json(showData)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'GetRouteMain No Data')
            await errResponse(res)
        }
    } catch (e) {
        await createLog('500',res.method,req.originalUrl,res.e,error.stack)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getRoute.post('/getRouteDetail', async (req, res) => {
    try {
        const data = await Route.findOne({id: req.body.id}, {_id: 0, __v: 0})

        if(data){
            const showData = []
            for (let i = 0; i < data.list.length; i++) {
                // console.log(data.list[i])
                const prefix = data.list[i].storeId.substring(0, 2)
                const numberPart = data.list[i].storeId.substring(2)
                const dataStore = await Store.findOne({storeId: data.list[i].storeId}, {name: 1, _id: 0})
                // console.log(prefix)
                const status_store = await Route.findOne({id: req.body.id}, {
                    '_id': 0,
                    'list': {$elemMatch: {'storeId': data.list[i].storeId}}
                }).exec()
                const statusText = await statusDes.findOne({type: 'route'}, {'list': {$elemMatch: {'id': status_store.list[0].status}}})
                // console.log()
                const showData_obj = {
                    idRoute: data.id,
                    id: data.list[i].storeId,
                    name: dataStore.name,
                    status: statusText.list[0].id,
                    statusText: statusText.list[0].name
                }
                showData.push(showData_obj)
            }
            const statusCounts = _.countBy(showData, 'status')
            // console.log(statusCounts)
            const status0Count = statusCounts['0'] || 0
            const status1Count = statusCounts['1'] || 0
            const status2Count = statusCounts['2'] || 0

            const mainData = {
                targetGroup: showData.length,
                progress: status0Count,
                checkin: status1Count,
                buy: status2Count,
                list: showData
            }
            await createLog('200',req.method,req.originalUrl,res.body,'GetRouteDetail Data complete')
            res.status(200).json(mainData)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'GetRouteDetail No Data')
            await errResponse(res)
        }
    } catch (e) {
        console.log(e)
        await createLog('500',res.method,req.originalUrl,res.e,error.stack)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getRoute.post('/getRouteStore', async (req, res) => {
    try {
        const data = await Store.find({$and: [{area: req.body.area, status: '20'}]}, {
            _id: 0,
            storeId: 1,
            name: 1,
            route: 1,
            address: 1,
            distric: 1,
            subDistric: 1,
            province: 1,
            provinceCode: 1
        }).sort({storeId: 1})
        
        if(data.length > 0){
            await createLog('200',req.method,req.originalUrl,res.body,'GetRouteStore Data complete')
            res.status(200).json(data)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'GetRouteStore No Data')
            await errResponse(res)
        }
    } catch (e) {
        await createLog('500',res.method,req.originalUrl,res.e,error.stack)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getRoute.post('/getStoreDetail', async (req, res) => {
    try {

        const data = await Route.findOne({id: req.body.idRoute}, {
            '_id': 0,
            'list': {$elemMatch: {'storeId': req.body.storeId}}
        }).exec()
        if(data){
            const id = req.body.storeId;


            // let idCharecterEnd = 0;
            // while (isNaN(parseInt(id[idCharecterEnd])) && idCharecterEnd < id.length) {
            //     idCharecterEnd++;
            // }
            // const idCharecter = id.substring(0, idCharecterEnd);
            // const idNumber = parseInt(id.substring(idCharecterEnd));

            const dataStore = await Store.findOne({
                storeId: id
            }, {})


            const mainData = {
                storeId: id,
                name: dataStore.name,
                address: dataStore.address + ' ' + dataStore.distric + ' ' + dataStore.subDistric + ' ' + dataStore.province,
                list: data.list[0].listCheck.map(item => {
                    const dateObject = new Date(item.date);
                    const formattedDate = `${dateObject.getFullYear()}/${dateObject.getMonth() + 1}/${dateObject.getDate()}`;
                    return {
                        number: item.number,
                        orderId: item.orderId,
                        date: formattedDate,
                        _id: item._id
                    };
                })
            }
            await createLog('200',req.method,req.originalUrl,res.body,'GetStoreDetail Data complete')
            res.status(200).json(mainData)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'GetStoreDetail No Data')
            await errResponse(res)
        }
    } catch (e) {
        await createLog('500',res.method,req.originalUrl,res.e,error.stack)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getRoute.post('/checkDistance', async (req, res) => {
    try {
        const {checkDistanceLatLon, spltitString} = require('../../utils/utility')
        const dataStore = await Store.findOne({storeId:req.body.storeId}, {
            latitude: 1,
            longtitude: 1,
            _id:0
        })
        if(dataStore){
            const distance = await checkDistanceLatLon(parseFloat(dataStore.latitude),parseFloat(dataStore.longtitude),parseFloat(req.body.latitude),parseFloat(req.body.longtitude),'K')
            if(distance >= 1){
                var dist = distance.toFixed(2) + ' km'
            }else{
                var dist = (distance*1000).toFixed(2) + ' m'
            }

            if(distance > 0.2){
                var response = {
                    status: 202,
                    message:'Not Allowed Checkin',
                    additionalData:0,
                    distance:dist
                }
            }else{
                var response = {
                    status: 201,
                    message:'Allowed Checkin',
                    additionalData:1,
                    distance:dist
                }
            }
            await createLog('200',req.method,req.originalUrl,res.body,'CheckDistance complete')
            res.status(200).json(response)
        }else{
            await createLog('200',req.method,req.originalUrl,res.body,'CheckDistance No Data')
            await errResponse(res)
        }
    } catch (e) {
        await createLog('500',res.method,req.originalUrl,res.e,error.stack)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getRoute