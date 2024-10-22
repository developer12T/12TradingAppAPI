const express = require('express')
require('../../configs/connect')
const addStore = express.Router()
const { Store, Beauty, Marketing } = require('../../models/store')
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
    const { available, updateAvailable } = require('../../services/numberSeriers');
    const { currentdateDash, checkDistanceLatLon, currentYearToDigi, currentYear, currentdateSlash } = require('../../utils/utility.js');
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
        } = req.body;

        const idAvailable = await available(currentYear(), typeNumberSeries, zoneNumberSeries);
        const poliAgree = {
            status: policyConsent,
            date: currentdateDash()
        };
        const approveData = {
            status: "19",
            dateSend: currentdateDash(),
            dateAction: "",
            appPerson: ""
        };
        let idAviModi = idAvailable + '';
        let idSt;

        if (idAviModi.length === 1) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + '0000' + idAviModi;
        } else if (idAviModi.length === 2) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + '000' + idAviModi;
        } else if (idAviModi.length === 3) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + '00' + idAviModi;
        } else if (idAviModi.length === 4) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + '0' + idAviModi;
        } else if (idAviModi.length === 5) {
            idSt = 'M' + zoneNumberSeries + currentYearToDigi() + idAviModi;
        } else {
            idSt = 'over';
        }

        if (idSt === 'over') {
            await createLog('500', req.method, req.originalUrl, res.body, 'storeId is Over length');
            res.status(200).json({
                status: 500, message: 'storeId is Over length'
            });
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
                status: "10",
                policyConsent: poliAgree,
                imageList,
                shippingAddress,
                note,
                createdDate: currentdateSlash(),
                updatedDate: currentdateDash()
            };

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
            });

            const storeReplace = [];
            let latLonCon = 0;
            let taxIdCon = 0;
            let nameCon = 0;

            for (const listData of dataLatLonStore) {
                if ((latitude === listData.latitude) && (longtitude === listData.longtitude)) {
                    const StoreFind = await Store.findOne({ storeId: listData.storeId });
                    const list = await status.findOne({ type: 'store', 'list.id': StoreFind.status });
                    const matchedObject = _.find(list.list, { 'id': StoreFind.status });

                    const dataStoreReplace = {
                        id: StoreFind.storeId,
                        name: StoreFind.name,
                        status: matchedObject.id,
                        statusText: matchedObject.name,
                    };
                    storeReplace.push(dataStoreReplace);
                    latLonCon = 1;
                }
            }

            const StoreTaxReplace = [];
            for (const listStruc of dataLatLonStore) {
                if (listStruc.taxId && listStruc.taxId === taxId) {
                    taxIdCon = 1;
                    StoreTaxReplace.push({
                        storeId: listStruc.storeId,
                        storeName: listStruc.name
                    });
                }

                if (listStruc.name === name) {
                    nameCon = 1;
                }
            }

            if ((latLonCon === 1) && (taxIdCon === 1) && (nameCon === 1)) {
                await createLog('201', req.method, req.originalUrl, res.body, 'Store Replace');
                res.status(200).json({
                    status: 201, message: 'Store Replace', additionalData: StoreTaxReplace
                });
            } else {
                await Store.create(mainData);

                const idRoute = `${area}${route}`;
                const responseAddRoute = await axios.post(process.env.API_URL_IN_USE + '/cms/route/addRouteStore', {
                    area: area,
                    idRoute: idRoute,
                    list: [mainData.storeId]
                });

                await updateAvailable(currentYear(), typeNumberSeries, zoneNumberSeries, idAvailable + 1);
                await createLog('200', req.method, req.originalUrl, res.body, 'Store added successfully');
                res.status(200).json({
                    status: 201,
                    message: 'Store added successfully',
                    addRoute: { responseData: responseAddRoute.data, message: 'Success' },
                    additionalData: { storeId: idSt, storeName: name }
                });
            }
        }
    } catch (error) {
        console.log(error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});

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

addStore.post('/addBeautyFromM3', async (req, res) => {
    try {
        const dataArray = []
        const response = await axios.post('http://58.181.206.159:9814/cms_api/cms_customer_beauty.php')
        for (const list of response.data) {
            const mainData = {
                "storeId": list.storeId,
                "name": list.name,
                "area": list.area,
                status: 'Y',
                createdDate: currentdateDash(),
                updatedDate: currentdateDash()
            }
            const StoreIf = await Beauty.findOne({ storeId: list.storeId })
            if (!StoreIf) {
                await Beauty.create(mainData)
            } else {
                const idStoreReplace = {
                    idStore: list.storeId,
                    name: list.name
                }
                dataArray.push(idStoreReplace)
            }
        }
        await createLog('200', req.method, req.originalUrl, res.body, 'Beauty Added Succesfully')
        res.status(200).json({ status: 201, message: 'Beauty Added Succesfully', additionalData: dataArray })

    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

addStore.post('/addStoreMkFromM3', async (req, res) => {
    try {
        const dataArray = []
        const response = await axios.post('http://58.181.206.159:9814/cms_api/cms_customer_mk.php')
        for (const list of response.data) {
            const mainData = {
                "storeId": list.storeId,
                "name": list.name,
                "area": list.area,
                status: 'Y',
                createdDate: currentdateDash(),
                updatedDate: currentdateDash()
            }
            const StoreIf = await Marketing.findOne({ storeId: list.storeId })
            if (!StoreIf) {
                await Marketing.create(mainData)
            } else {
                const idStoreReplace = {
                    idStore: list.storeId,
                    name: list.name
                }
                dataArray.push(idStoreReplace)
            }
        }
        await createLog('200', req.method, req.originalUrl, res.body, 'Store Added Succesfully')
        res.status(200).json({ status: 201, message: 'Store Added Succesfully', additionalData: dataArray })

    } catch (error) {
        console.log(error)
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

addStore.post('/updateStatusStore', async (req, res) => {
    try {
        const { storeId, status } = req.body
        if (!storeId) {
            await createLog('501', req.method, req.originalUrl, res.body, 'require body')
            res.status(501).json({ status: 501, message: 'require body' })
        } else {

            await Store.updateOne({ storeId: storeId }, { $set: { status: status, updatedDate: currentdateDash() } })
            await createLog('200', req.method, req.originalUrl, res.body, 'update Status Successfully')
            res.status(200).json({ status: 200, message: 'Update Status Successfully' })

        }
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
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