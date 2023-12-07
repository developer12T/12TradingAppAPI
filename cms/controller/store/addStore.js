const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('../../configs/connect')
const addStore = express.Router()
const {Store} = require('../../models/store')
const {available, updateAvailable} = require("../../services/numberSeriers")
const {currentdateDash} = require("../../utils/utility");
const axios = require('axios')
const storage = multer.memoryStorage()
const upload = multer({storage: storage})

addStore.post('/addStore', upload.single('picture'), async (req, res) => {
    const {available, updateAvailable} = require('../../services/numberSeriers')
    const {currentdatena, currentdateDash} = require('../../utils/utility.js')
    try {

        // เพิ่มรูปภาพ
        // const image = req.file
        // const imageName = 'รหัสร้าน_' + currentdatena() + path.extname(image.originalname)
        // const imagePath = path.join(__dirname, '../../public/image/store', imageName)
        // fs.writeFileSync(imagePath, image.buffer)
        // สิ้นสุด

        const {
            taxId,
            name,
            tel,
            route,
            type,
            addressTitle,
            distric,
            subDistric,
            province,
            provinceCode,
            postCode,
            zone,
            latitude,
            longtitude,
            lineId,
            policyConsent,
            imageList,
            note,
            numberSeries
        } = req.body
        const idAvailable = await available(numberSeries.type, numberSeries.zone)
        const poliAgree = {
            status: policyConsent,
            date: currentdateDash()
        }
        // console.log(idAvailable)
        const approveData = {
            status: "1",
            dateSend: currentdateDash(),
            dateAction: "",
            appPerson: ""
        }
        const mainData = {
            idCharecter: numberSeries.zone,
            idNumber: idAvailable,
            taxId,
            name,
            tel,
            route,
            type,
            addressTitle,
            distric,
            subDistric,
            province,
            provinceCode,
            postCode,
            zone,
            latitude,
            longtitude,
            lineId,
            approve: approveData,
            status: "0",
            policyConsent: poliAgree,
            imageList,
            note,
            createdDate: currentdateDash(),
            updatedDate: currentdateDash()
        }



        const validation = await Store.findOne({latitude:latitude,longtitude:longtitude})
        if(validation){

        }else{

        }
        function distance(lat1, lon1, lat2, lon2, unit) {
            if ((lat1 == lat2) && (lon1 == lon2)) {
                return 0;
            }
            else {
                var radlat1 = Math.PI * lat1/180;
                var radlat2 = Math.PI * lat2/180;
                var theta = lon1-lon2;
                var radtheta = Math.PI * theta/180;
                var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                if (dist > 1) {
                    dist = 1;
                }
                dist = Math.acos(dist);
                dist = dist * 180/Math.PI;
                dist = dist * 60 * 1.1515;
                if (unit=="K") { dist = dist * 1.609344 }
                if (unit=="N") { dist = dist * 0.8684 }
                return dist;
            }
        }

        console.log('test cal length :'+distance(13.739622,100.604019,13.739378,100.604216,'K'))
        const newStore = new Store(mainData)
        await newStore.save()

        await updateAvailable(numberSeries.type, numberSeries.zone, idAvailable + 1)

        res.status(200).json({
            status: 201, message: 'Store added successfully', additionalData: idAvailable
        })
        // res.status(200).json({ message: 'Store added successfully'})
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

addStore.post('/addStoreFormM3', async (req, res) => {
    try {
        const cleanData = (data) => {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const value = data[key]
                    if (typeof value === 'string') {
                        data[key] = value.replace(/\s/g, '')
                    }
                }
            }
            return data
        };
        const {DATA_STORE_M3} = require('../../services/getStoreM3')
        const data = await DATA_STORE_M3(req.body.customertype)
        const showData = []
        // console.log(data)
        //     res.status(200).json({
        //     status: 201, message: 'Store added successfully', additionalData: idAvailable
        // })

        for (const splitData of data) {
           //  const idC = splitData.customercode.substring(0, 3)
           // const idN = splitData.customercodesubstring(3)

            const regex = /([A-Za-z]+)(\d+)/;
            const match = splitData.customercode.match(regex)
                const result = {
                    prefix: match[1],
                    subfix: match[2]
                }
            const poliAgree = {
                status: req.body.policyConsent,
                date: currentdateDash()
            }
            // console.log(idAvailable)
            const approveData = {
                status: "2",
                dateSend: currentdateDash(),
                dateAction: currentdateDash(),
                appPerson: "system"
            }

            const mainData = {
                "idCharecter":result.prefix,
                "idNumber":result.subfix,
                "taxId": splitData.taxno,
                "name": splitData.customername,
                "tel": splitData.phone,
                "route": "",
                "type": splitData.customertype,
                "addressTitle": splitData.addressid + ','+splitData.address1 + ','+splitData.address2+ ','+splitData.address3,
                "distric": "",
                "subDistric": "",
                "province": "",
                "provinceCode": "",
                "postCode ": "",
                "zone": splitData.zone,
                "area": splitData.area,
                "latitude": "",
                "longtitude": "",
                "lineId": "",
                approve: approveData,
                status: "1",
                policyConsent: poliAgree,
                "imageList": [
                ],
                "note ": "",
                createdDate: currentdateDash(),
                updatedDate: currentdateDash()
            }
            showData.push(mainData)
        }
        for (const key in showData) {
            if (showData.hasOwnProperty(key)) {
                const value = showData[key]
                if (typeof value === 'string') {
                    showData[key] = value.replace(/\s/g, '')
                }
            }
        }

        const cleanedShowData = showData.map(item => cleanData(item))
        await Store.create(cleanedShowData)
        // res.json(cleanedShowData)
        res.status(200).json({status:201,message:'Store Added Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})


module.exports = addStore