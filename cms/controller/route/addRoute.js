const express = require('express')

require('../../configs/connect')
const addRoute = express.Router()
const {Route, Checkin} = require('../../models/route')
const {Store} = require("../../models/store");

addRoute.post('/addRoute', async (req, res) => {
    try {
        const {currentdateFormatYearMont} = require('../../utils/utility')
        const idRu = await Route.findOne({round: currentdateFormatYearMont()},).sort({id: -1})
        if (!idRu) {
            var idRoute = currentdateFormatYearMont() + 'R1'
        } else {
            var prefix = idRu.id.slice(0, 7)
            var subfix = parseInt(idRu.id.slice(7)) + 1

            var idRoute = prefix + subfix
        }

        const listStore = []

        for (const storeList of req.body.list) {
            // const dataStore = await Store.findOne({idCharecter:list.slice(3),idNumber:parseInt(list.slice(0,3))})
            const newData = {
                storeId: storeList,
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
            id: idRoute,
            area: req.body.area,
            round: currentdateFormatYearMont(),
            list: listStore
        }
        await Route.create(mainData)
        res.status(200).json({status: 201, message: 'Add Route Successfully'})
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
                    }, {$set: {'list.$.note': req.body.note, 'list.$.status': '1','list.$.dateCheck': currentdateDash()}})
                    responseMessage = 'เข้าเยี่ยมแบบไม่ขายสินค้า'
                }
                break
            case 'sale':

                const statusCheck2 = await Route.findOne({
                    id: req.body.idRoute,
                    area: req.body.area
                }, {'list': {$elemMatch: {'storeId': req.body.storeId}}})
                console.log(statusCheck2.list[0].listCheck)
                if(statusCheck2.list[0].listCheck.length === 0){
                   var number = 1
                }else{
                    const maxNumber = statusCheck2.list[0].listCheck.reduce((max, item) => (item.number > max ? item.number : max), 0)
                    const nextNumber = maxNumber + 1
                    var number = nextNumber
                }

                const subData = {
                    number:number,
                    orderId:req.body.orderId,
                    date:currentdateDash()
                }
                await Route.updateOne({
                    id: req.body.idRoute,
                    area: req.body.area,
                    'list.storeId': req.body.storeId
                }, {$push: {'list.$.listCheck': subData},$set:{'list.$.dateCheck':currentdateDash()}})
                responseMessage = 'เข้าเยี่ยมแบบขายสินค้า'
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