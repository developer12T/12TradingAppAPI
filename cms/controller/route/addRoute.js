const express = require('express')

require('../../configs/connect')
const addRoute = express.Router()
const { Route, Checkin } = require('../../models/route')
const { Store } = require("../../models/store");
const { currentdateDash, currentdateFormatYearMont } = require("../../utils/utility");
const axios = require("axios");
const { createLog } = require("../../services/errorLog");
const { status } = require('../../models/status');

addRoute.post('/addRouteStore', async (req, res) => {
    try {

        const additionalMessage = []

        for (const storeList of req.body.list) {
            // const dataStore = await Store.findOne({idCharecter:list.slice(3),idNumber:parseInt(list.slice(0,3))})
            const dataStore = await Route.findOne({
                area: req.body.area,
                id: req.body.idRoute,
                'list.storeId': storeList
            })
            // console.log('dataStore ::' + storeList)
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
                }, { $push: { 'list': newData } })
            } else {
                additionalMessage.push(storeList)
            }
        }
        if (additionalMessage.length > 0) {
            const message = {
                message: `list already exists not add to route ${req.body.idRoute}`
            }

            additionalMessage.push(message)
        } else { }

        await createLog('200', req.method, req.originalUrl, res.body, 'Add Store to Route Successfully')

        res.status(200).json({
            status: 201,
            message: 'Add Store to Route Successfully',
            additionalMessage
        })
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

addRoute.post('/addRouteStoreFromM3', async (req, res) => {
    try {
        const dataFetch = await axios.post('http://58.181.206.159:9814/cms_api/cms_route2.php')
        const { currentdateFormatYearMont } = require('../../utils/utility')
        const idRu = await Route.findOne({ period: currentdateFormatYearMont() },).sort({ id: -1 })
        if (!idRu) {
            var idRoute = currentdateFormatYearMont() + 'R1'
        } else {
            var prefix = idRu.id.slice(0, 7)
            var subfix = parseInt(idRu.id.slice(7)) + 1

            var idRoute = prefix + subfix
        }
        const listStore = []

        for (const storeList of dataFetch.data) {
            for (const listSub of storeList.list) {

                // const dataStore = await Store.findOne({idCharecter:list.slice(3),idNumber:parseInt(list.slice(0,3))})
                const newData = {
                    storeId: listSub,
                    latitude: '',
                    longtitude: '',
                    status: 0,
                    note: '',
                    dateCheck: '****-**-**T**:**',
                    listCheck: []
                }
                listStore.push(newData)
            }
            const mainData = {
                id: storeList.idRoute,
                area: storeList.area,
                period: currentdateFormatYearMont(),
                list: listStore
            }
            await Route.create(mainData)
            listStore.length = 0
        }
        await createLog('200', req.method, req.originalUrl, res.body, 'Add Route Successfully')
        res.status(200).json({ status: 201, message: 'Add Route Successfully' })
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

addRoute.post('/visit', async (req, res) => {
    try {
        const { currentdateFormatYearMont, currentdateDash } = require("../../utils/utility");
        let responseMessage
        switch (req.body.case) {
            case 'noSales':
                const statusCheck = await Route.findOne({
                    id: req.body.idRoute,
                    area: req.body.area
                }, { 'list': { $elemMatch: { 'storeId': req.body.storeId } } })
                if (statusCheck) {
                    if (statusCheck.list[0].status === '1') {
                        responseMessage = 'เข้าเยี่ยมแบบไม่ขายสินค้า/เข้าเยี่ยมไปแล้ว'
                    } else {
                        await Route.updateOne({
                            id: req.body.idRoute,
                            area: req.body.area,
                            'list.storeId': req.body.storeId
                        }, {
                            $set: {
                                'list.$.latitude': req.body.latitude,
                                'list.$.longtitude': req.body.longtitude,
                                'list.$.note': req.body.note,
                                'list.$.status': '1',
                                'list.$.dateCheck': currentdateDash()
                            }
                        })
                        responseMessage = 'เข้าเยี่ยมแบบไม่ขายสินค้า'
                    }
                    await createLog('200', req.method, req.originalUrl, res.body, 'CheckIn has complete')
                    res.status(200).json({
                        status: 201,
                        message: 'CheckIn has complete',
                        additionalMessage: responseMessage,
                    })
                } else {
                    await createLog('200', req.method, req.originalUrl, res.body, 'idRoute No Data')
                    res.status(200).json({
                        status: 204,
                        message: 'idRoute No Data',
                        additionalMessage: responseMessage,
                    })
                }

                break
            case 'sale':
                if (req.body.orderId) {
                    const statusCheck2 = await Route.findOne({
                        id: req.body.idRoute,
                        area: req.body.area
                    }, { 'list': { $elemMatch: { 'storeId': req.body.storeId } } })

                    if (statusCheck2) {
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
                                status: req.body.status,
                                date: currentdateDash()
                            }
                            await Route.updateOne({
                                id: req.body.idRoute,
                                area: req.body.area,
                                'list.storeId': req.body.storeId
                            }, {
                                $push: { 'list.$.listCheck': subData },
                                $set: { 'list.$.dateCheck': currentdateDash(), 'list.$.status': '2', 'list.$.latitude': req.body.latitude, 'list.$.longtitude': req.body.longtitude, }
                            })
                            responseMessage = 'เข้าเยี่ยมแบบขายสินค้า'
                        } else {
                            const subData = {
                                number: number,
                                orderId: req.body.orderId,
                                status: req.body.status,
                                date: currentdateDash()
                            }
                            await Route.updateOne({
                                id: req.body.idRoute,
                                area: req.body.area,
                                'list.storeId': req.body.storeId
                            }, { $push: { 'list.$.listCheck': subData } })

                            responseMessage = 'เข้าเยี่ยมแล้ว/เพิ่มรายการขายในเส้นทางสำเร็จ'
                        }
                        await createLog('200', req.method, req.originalUrl, res.body, 'CheckIn has complete sale yes')
                        res.status(200).json({
                            status: 201,
                            message: 'CheckIn has complete',
                            additionalMessage: responseMessage,
                        })
                    } else {
                        await createLog('200', req.method, req.originalUrl, res.body, 'idRoute No Data')
                        res.status(200).json({
                            status: 204,
                            message: 'idRoute No Data',
                            additionalMessage: responseMessage,
                        })
                    }

                } else {
                    await createLog('200', req.method, req.originalUrl, res.body, 'OrderId Not found')
                    res.status(200).json({
                        status: 204,
                        message: 'OrderId Not found',
                        additionalMessage: responseMessage,
                    })
                }

                break
            default:
                responseMessage = ' Is no this case in the system.'
                await createLog('200', req.method, req.originalUrl, res.body, 'idRoute No Data')
                res.status(200).json({
                    status: 204,
                    message: 'idRoute No Data',
                    additionalMessage: responseMessage,
                })
                break
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


module.exports = addRoute