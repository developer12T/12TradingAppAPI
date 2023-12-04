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
        // console.log(mainData)
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
        const {DATA_STORE_M3} = require('../../services/getStoreM3')
        const data = await DATA_STORE_M3(req.body.customertype)
        console.log(data)
        //     res.status(200).json({
        //     status: 201, message: 'Store added successfully', additionalData: idAvailable
        // })

        for (const splitData of data) {
           //  const idC = splitData.customercode.substring(0, 3)
           // const idN = splitData.customercodesubstring(3)
            const mainData = {
                "idNumber":12,
                "idNumber":12,
                "taxId": splitData.taxno,
                "name": splitData.customername,
                "tel": splitData.phone,
                "route": "R01",
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
                "policyConsent": "Agree",
                "imageList": [
                ],
                "note ": ""
            }
        }

        res.json(data)
        // res.status(200).json({ message: 'Store added successfully'})
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})


module.exports = addStore