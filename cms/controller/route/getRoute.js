const express = require('express')

require('../../configs/connect')
const getRoute = express.Router()
const {Route, Checkin} = require('../../models/route')
const {currentdateDash} = require("../../utils/utility");
const {Store} = require("../../models/store");
const {log} = require("winston");

getRoute.get('/getAll', async (req, res) => {
    try {
        const data = await Route.find().exec()
        res.status(200).json(data)

    } catch (e) {
        res.status(500).json(e)
    }
})

getRoute.post('/getRouteShowHome', async (req, res) => {
    try {
        const showData = []
        let statusCount = 0
        let statusBlack = 0
        const data = await Checkin.find({}, {_id: 0}).exec()
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].detail.length; j++) {
                statusCount += (data[i].detail[j].status === 'เช็คอิน') ? 1 : 0;
                statusBlack = data[i].detail.length
            }
            const day = (i + 1 < 10) ? '0' + (i + 1) : (i + 1)
            var descript =
                statusCount < statusBlack ? 'in progress' :
                    statusCount === statusBlack ? 'progress' :
                        statusBlack === 0 ? 'take action' :
                            'progress'
            const showData_obj = {
                id: data[i].id,
                day: 'Day ' + day,
                route: i + 1,
                statusFront: statusCount,
                statusBack: statusBlack,
                descript: descript
            }
            showData.push(showData_obj)
            statusCount = 0
        }
        res.status(200).json(showData)

    } catch (e) {
        res.status(500).json(e)
    }
})

getRoute.post('/getRouteDetail', async (req, res) => {
    try {
        const data = await Route.findOne({id:req.body.id},{ _id:0,__v:0 })
        const showData = []
        for (let i = 0 ; i < data.list.length;i++){
            console.log(data.list[i])
            const prefix = data.list[i].substring(0, 3)
            const numberPart = data.list[i].substring(3)
            const dataStore = await Store.findOne({idCharecter:prefix,idNumber:numberPart},{name:1,_id:0})
            // console.log(prefix)
            const showData_obj = {
                id:data.list[i],
                name:dataStore.name
            }
            showData.push(showData_obj)
        }
        res.status(200).json(showData)

    } catch (e) {
        res.status(500).json(e)
    }
})


module.exports = getRoute