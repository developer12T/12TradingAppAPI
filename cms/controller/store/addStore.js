const express = require('express')
require('../../configs/connect')
const addStore = express.Router()
const { Store } = require('../../models/store')
const { currentdateDash, checkDistanceLatLon } = require("../../utils/utility")
const { status } = require('../../models/status')
const _ = require('lodash')
const axios = require("axios")
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const bcrypt = require("bcrypt")
const { updateAvailable } = require("../../services/numberSeriers")
const { createLog } = require("../../services/errorLog")
const { currentdatena } = require('../../utils/utility')

// addStore.post('/uploadImg', upload.single('StoreImage'), async (req, res) => {
//     try {
//         const {currentdatena} = require('../../utils/utility')
//         const image = req.file
//         const hashedPassword = await bcrypt.hash(image.originalname, 10)
//         const imageName = hashedPassword + '-DATE' + currentdatena() + path.extname(image.originalname)
//         const imagePath = path.join(__dirname, '../../public/image/store', imageName)
//         await fs.writeFileSync(imagePath, image.buffer)
//         await createLog('200', req.method, req.originalUrl, res.body, 'Added Image Successfully')
//         res.status(200).json({
//             status: 201,
//             message: 'Added Image Successfully',
//             additionalData: {ImageName: imageName, path: imagePath}
//         })
//     } catch (error) {
//         await createLog('500', req.method, req.originalUrl, res.body, error.message)
//         res.status(500).json({status: 501, message: error.message})
//     }
// })

addStore.post('/uploadImg', upload.single('StoreImage'), async (req, res) => {
    try {
        const image = req.file;
        if (!image) {
            throw new Error('No file uploaded');
        }

        const imageName = `${Date.now()}-${currentdatena()}${path.extname(image.originalname)}`;
        const imagePath = path.join(__dirname, '../../public/image/store', imageName);

        await fs.promises.writeFile(imagePath, image.buffer);
        await createLog('200', req.method, req.originalUrl, res.body, 'Added Image Successfully');

        res.status(200).json({
            status: 201,
            message: 'Added Image Successfully',
            additionalData: { ImageName: imageName, path: imagePath }
        });
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({ status: 501, message: error.message });
    }
})

addStore.post('/addStore', async (req, res) => {
    const { available, updateAvailable } = require('../../services/numberSeriers')
    const { currentdateDash, checkDistanceLatLon, currentYearToDigi, currentYear } = require('../../utils/utility.js')
    try {
        const {
            taxId,
            name,
            tel,
            route,
            type,
            address,
            district,
            subDistrict,
            province,
            provinceCode,
            postCode,
            shippingAddress,
            zone,
            area,
            latitude,
            longtitude,
            lineId,
            policyConsent,
            imageList,
            note,
            typeNumberSeries,
            zoneNumberSeries
        } = req.body
        console.log(zoneNumberSeries);
        const idAvailable = await available(currentYear(), typeNumberSeries, zoneNumberSeries)
        // console.log(idAvailable+'test');
        const poliAgree = {
            status: policyConsent,
            date: currentdateDash()
        }
        // console.log(idAvailable)
        const approveData = {
            status: "19",
            dateSend: currentdateDash(),
            dateAction: "",
            appPerson: ""
        }
        let idAviModi = idAvailable + ''
        let idSt

        if (idAviModi.length === 1) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + '0000' + idAviModi
        } else if (idAviModi.length === 2) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + '000' + idAviModi
        } else if (idAviModi.length === 3) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + '00' + idAviModi
        } else if (idAviModi.length === 4) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + '0' + idAviModi
        } else if (idAviModi.length === 5) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + idAviModi
        } else {
            idSt = 'over'
        }

        if (idSt === 'over') {
            await createLog('500', req.method, req.originalUrl, res.body, 'storeId is Over length')
            res.status(200).json({
                status: 500, message: 'storeId is Over length'
            })
        } else {

            const mainData = {
                storeId: idSt,
                taxId,
                name,
                tel,
                route,
                type,
                address,
                district,
                subDistrict,
                province,
                provinceCode,
                postCode,
                zone,
                area,
                latitude,
                longtitude,
                lineId,
                approve: approveData,
                status: "19",
                policyConsent: poliAgree,
                imageList,
                shippingAddress,
                note,
                createdDate: currentdateDash(),
                updatedDate: currentdateDash()
            }

            var latLonCon = 0
            var taxIdCon = 0
            var nameCon = 0
            var addressCon = 0

            // const listLenght = []
            const dataLatLonStore = await Store.find({ subDistrict: subDistrict, district: district, province: province }, {
                storeId: 1,
                latitude: 1,
                longtitude: 1,
                _id: 0,
                taxId: 1,
                name: 1,
                address: 1,
                district: 1,
                subDistrict: 1,
                province: 1,
            })

            const storeReplace = []
            for (const listData of dataLatLonStore) {
                console.log(listData)
                if ((latitude === listData.latitude) && (longtitude === listData.longtitude)) { // check dist less than 10 m 0.01 km
                    const StoreFind = await Store.findOne({ storeId: listData.storeId })
                    const list = await status.findOne({ type: 'store', 'list.id': StoreFind.status });
                    const matchedObject = _.find(list.list, { 'id': StoreFind.status });
                    // console.log(list)
                    const dataStoreReplace = {
                        id: StoreFind.storeId,
                        name: StoreFind.name,
                        status: matchedObject.id,
                        statusText: matchedObject.name,
                        distance: parseFloat(listData.distance)
                    }
                    storeReplace.push(dataStoreReplace)
                    latLonCon = 1
                }
            }

            const StoreTaxReplace = []
            for (const listStruc of dataLatLonStore) {
                if (!listStruc.taxId) {
                    taxIdCon = 0
                } else {
                    const taxCheck = await Store.findOne({ taxId: listStruc.taxId })
                    if (!taxCheck) {
                        taxIdCon = 0
                    } else {
                        taxIdCon = 1
                        var StoreTaxReplaceObj = {
                            storeId: listStruc.storeId,
                            storeName: listStruc.name
                        }
                        StoreTaxReplace.push(StoreTaxReplaceObj)
                    }
                }
                const text1 = listStruc.name;
                const text2 = name;
                if (text1 === text2) {
                    nameCon = 1
                }
            }

            if ((latLonCon === 1) && (taxIdCon === 1) && (nameCon === 1)) { // replace
                await createLog('201', req.method, req.originalUrl, res.body, 'Store Replace')
                res.status(200).json({
                    status: 201, message: 'Store Replace', additionalData: StoreTaxReplace
                })
            } else { // no replace
                await Store.create(mainData)
                const responseAddRoute = await axios.post(process.env.API_URL_IN_USE + '/cms/route/addRouteStore', {
                    area: area,
                    idRoute: route,
                    list: [mainData.storeId]
                })

                await updateAvailable(currentYear(), typeNumberSeries, zoneNumberSeries, idAvailable + 1)
                await createLog('200', req.method, req.originalUrl, res.body, 'Store added successfully')
                res.status(200).json({
                    status: 201,
                    message: 'Store added successfully',
                    addRoute: { responseData: responseAddRoute.data, message: 'Success' },
                    additionalData: { storeId: idSt, storeName: name }
                })
            }
        }
    } catch (error) {

        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

addStore.post('/addStoreFormM3', async (req, res) => {
    try {
        const dataArray = []
        const response = await axios.post('http://58.181.206.159:9814/cms_api/cms_customer2.php')
        for (const splitData of response.data) {
            const approveData = {
                dateSend: currentdateDash(),
                dateAction: currentdateDash(),
                appPerson: "system"
            }
            const poliAgree = {
                status: 'Agree',
                date: currentdateDash()
            }
            const mainData = {
                "storeId": splitData.storeId,
                "taxId": splitData.taxId,
                "name": splitData.name,
                "tel": splitData.tel,
                "route": splitData.route,
                "type": splitData.type,
                "typeName": splitData.typeName,
                "address": splitData.address,
                "district": splitData.district,
                "subDistrict": splitData.subDistrict,
                "province": splitData.province,
                "provinceCode": splitData.provinceCode,
                "postCode ": splitData.postCode,
                "zone": splitData.zone,
                "area": splitData.area,
                "latitude": splitData.latitude,
                "longtitude": splitData.longtitude,
                "lineId": '',
                approve: approveData,
                status: '20',
                policyConsent: poliAgree,
                "imageList": [],
                "shippingAddress": [],
                "note ": "",
                createdDate: currentdateDash(),
                updatedDate: currentdateDash()
            }
            const StoreIf = await Store.findOne({ storeId: splitData.storeId })
            if (!StoreIf) {
                await Store.create(mainData)
            } else {
                const idStoreReplace = {
                    idStore: splitData.storeId,
                    name: splitData.name
                }
                dataArray.push(idStoreReplace)
            }
        }
        await createLog('200', req.method, req.originalUrl, res.body, 'Store Added Succesfully')
        res.status(200).json({ status: 201, message: 'Store Added Succesfully', additionalData: dataArray })

        // res.status(200).json({status: 201, message: 'Store Added Successfully'})
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

addStore.put('/updateStore', async (req, res) => {
    try {
        await createLog('200', req.method, req.originalUrl, res.body, 'Store Added Succesfully')
        res.status(200).json({ status: 201, message: 'Store Added Succesfully' })
    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = addStore