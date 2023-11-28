const express = require('express')

require('../../configs/connect')
const addRoute = express.Router()
const {Route, Checkin} = require('../../models/route')
const {currentdateFormatYearMont} = require("../../utils/utility");
const {Store} = require("../../models/store");

addRoute.post('/addRoute', async (req, res) => {
    try {
        const { currentdateFormatYearMont } = require('../../utils/utility')
        const idRu = await Route.findOne({round:currentdateFormatYearMont()},).sort({id:-1})
        if(!idRu){
            var idRoute = currentdateFormatYearMont()+'R1'
        }else{
            var prefix= idRu.id.slice(0,7)
            var subfix= parseInt(idRu.id.slice(7)) + 1

           var idRoute = prefix + subfix
        }

        const listStore = []

        for(const storeList of req.body.list){
            // const dataStore = await Store.findOne({idCharecter:list.slice(3),idNumber:parseInt(list.slice(0,3))})
            const newData = {
                storeId:storeList ,
                latitude:'',
                longtitude:'',
                status:0,
                note:'',
                dateCheck:'****-**-**T**:**',
                listCheck:[]
            }
            listStore.push(newData)
        }

        const mainData = {
            id:idRoute,
            area:req.body.area,
            round:currentdateFormatYearMont(),
            list:listStore
        }
        await Route.create(mainData)
        res.status(200).json({status:201,message:'Add Route Successfully'})
    } catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = addRoute