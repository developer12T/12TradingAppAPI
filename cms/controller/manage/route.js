const express = require('express')
require('../../configs/connect')
const {Unit} = require("../../models/product");
const {currentdateDash, currentdateFormatYearMont} = require("../../utils/utility");
const {Route} = require("../../models/route");
const {createLog} = require("../../services/errorLog");
const routeManage = express.Router()


routeManage.post('/newRoute', async(req, res) => {
    try {
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
            await createLog('200',req.method,req.originalUrl,res.body,'Add Route Successfully!')
            res.status(200).json({status: 201, message: 'Add Route Successfully'})
        } catch (e) {
            await createLog('500',req.method,req.originalUrl,res.body,e.message)
            res.status(500).json({
                status: 500,
                message: e.message
            })
        }
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

module.exports = routeManage
