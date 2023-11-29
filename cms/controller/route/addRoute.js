const express = require('express')

require('../../configs/connect')
const addRoute = express.Router()
const {Route, Checkin} = require('../../models/route')
const {Store} = require("../../models/store");
const {currentdateDash} = require("../../utils/utility");

addRoute.post('/addRouteStore', async (req, res) => {
    try {
        const {currentdateFormatYearMont} = require('../../utils/utility')

        const additionalMessage = []

        for (const storeList of req.body.list) {
            // const dataStore = await Store.findOne({idCharecter:list.slice(3),idNumber:parseInt(list.slice(0,3))})
            const dataStore = await Route.findOne({
                area: req.body.area,
                id: req.body.idRoute,
                'list.storeId': storeList
            })
            // console.log('dataStore ::' + dataStore)
            if (dataStore === null) {
                const newData = {
                    storeId: storeList,
                    latitude: '',
                    longtitude: '',
                    status: 0,
                    note: '',
                    dateCheck: '****-**-**T**:**',
                    listCheck: []
                }

                await Route.updateOne({
                    id: req.body.idRoute,
                    area: req.body.area,
                }, {$push: {'list': newData}})
            } else {
                additionalMessage.push(storeList)
            }
        }
        if(additionalMessage.length > 0){
           const message = {
               message:`list already exists not add to route ${req.body.idRoute}`
           }

           additionalMessage.push(message)
        }else{}



        res.status(200).json({
            status: 201,
            message: 'Add Store to Route Successfully',
            additionalMessage
        })
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

addRoute.post('/visit', async (req, res) => {
    try {
        const {currentdateFormatYearMont, currentdateDash} = require("../../utils/utility");
        let responseMessage
        switch (req.body.case) {
            case 'noSales':
                const statusCheck = await Route.findOne({
                    id: req.body.idRoute,
                    area: req.body.area
                }, {'list': {$elemMatch: {'storeId': req.body.storeId}}})
                if (statusCheck.list[0].status === '1') {
                    responseMessage = 'เข้าเยี่ยมแบบไม่ขายสินค้า/เข้าเยี่ยมไปแล้ว'
                } else {
                    await Route.updateOne({
                        id: req.body.idRoute,
                        area: req.body.area,
                        'list.storeId': req.body.storeId
                    }, {
                        $set: {
                            'list.$.note': req.body.note,
                            'list.$.status': '1',
                            'list.$.dateCheck': currentdateDash()
                        }
                    })
                    responseMessage = 'เข้าเยี่ยมแบบไม่ขายสินค้า'
                }
                break
            case 'sale':

                const statusCheck2 = await Route.findOne({
                    id: req.body.idRoute,
                    area: req.body.area
                }, {'list': {$elemMatch: {'storeId': req.body.storeId}}})
                // console.log(statusCheck2.list[0].listCheck)
                if (statusCheck2.list[0].listCheck.length === 0) {
                    var number = 1
                } else {
                    const maxNumber = statusCheck2.list[0].listCheck.reduce((max, item) => (item.number > max ? item.number : max), 0)
                    const nextNumber = maxNumber + 1
                    var number = nextNumber
                }

                if (statusCheck2.list[0].listCheck.length === 0) {
                    const subData = {
                        number: number,
                        orderId: req.body.orderId,
                        date: currentdateDash()
                    }
                    await Route.updateOne({
                        id: req.body.idRoute,
                        area: req.body.area,
                        'list.storeId': req.body.storeId
                    }, {
                        $push: {'list.$.listCheck': subData},
                        $set: {'list.$.dateCheck': currentdateDash(), 'list.$.status': '2'}
                    })
                    responseMessage = 'เข้าเยี่ยมแบบขายสินค้า'
                } else {
                    const subData = {
                        number: number,
                        orderId: req.body.orderId,
                        date: currentdateDash()
                    }
                    await Route.updateOne({
                        id: req.body.idRoute,
                        area: req.body.area,
                        'list.storeId': req.body.storeId
                    }, {$push: {'list.$.listCheck': subData}})
                    responseMessage = 'เข้าเยี่ยมแล้ว/เพิ่มรายการขายในเส้นทางสำเร็จ'
                }

                break
            default:
                responseMessage = ' Is no this case in the system.'
                break
        }
        res.status(200).json({
            status: 201,
            message: 'CheckIn has complete',
            additionalMessage: responseMessage,
        })
    } catch (e) {
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})


module.exports = addRoute