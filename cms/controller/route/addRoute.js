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
            var matches = idRu.match(/^(\D+)(\d+)(\D+)$/);

            if (matches && matches.length === 4) {
                var prefix = matches[1];
                var numericPart = parseInt(matches[2]);
                var suffix = matches[3];

                if (!isNaN(numericPart)) {
                    var idRoute = prefix + (numericPart + 1) + suffix;
                    console.log(idRoute);
                } else {
                    console.log("ไม่พบตัวเลขที่จะเพิ่ม");
                }
            } else {
                console.log("รูปแบบ idRu ไม่ถูกต้อง");
            }
        }

        const listStore = []
        for(const list of req.body.list){
            // const dataStore = await Store.findOne({idCharecter:list.slice(3),idNumber:parseInt(list.slice(0,3))})
            const newData = {
                storeId:list ,
                latitude:'',
                longtitude:'',
                status:0, // ทำ status
                dateCheck:'****-**-**T**:**',
                listCheck:[]
            }
            listStore.push(newData)
        }


        const mainData = {
            id:idRoute,
            area:req.body.area,
            round:currentdateFormatYearMont(),
            list:[listStore]
        }
        res.status(200).json(mainData)
    } catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = addRoute