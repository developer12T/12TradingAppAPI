const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('../../configs/connect')
const addStore = express.Router()
const {Store} = require('../../models/store')
const {available} = require("../../services/numberSeriers")

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

addStore.post('/newStore', upload.single('picture'), async (req, res) => {
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
            policyConsent,
            imageList,
            note,
            createdDate: currentdateDash(),
            updatedDate: currentdateDash()
        }
        console.log(mainData)
        const newStore = new Store(mainData)
        await newStore.save()

        await updateAvailable(numberSeries.type, numberSeries.zone, idAvailable + 1)

        res.status(200).json({message: 'Store added successfully', id_count: idAvailable})
        // res.status(200).json({ message: 'Store added successfully'})
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = addStore