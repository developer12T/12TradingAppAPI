const express = require('express')
require('../../configs/connect')
const addStore = express.Router()
const {Store} = require('../../models/store')
const {currentdateDash, checkDistanceLatLon} = require("../../utils/utility");
const {statusDes} = require('../../models/statusDes')
const _ = require('lodash')
addStore.post('/addStore', async (req, res) => {
    const {available, updateAvailable} = require('../../services/numberSeriers')
    const {currentdateDash, checkDistanceLatLon} = require('../../utils/utility.js')
    try {
        const {
            taxId,
            name,
            tel,
            route,
            type,
            address,
            distric,
            subDistric,
            province,
            provinceCode,
            postCode,
            zone,
            area,
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
            status: "19",
            dateSend: currentdateDash(),
            dateAction: "",
            appPerson: ""
        }
        const mainData = {
            storeId: numberSeries.zone+idAvailable,
            taxId,
            name,
            tel,
            route,
            type,
            address,
            distric,
            subDistric,
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
            note,
            createdDate: currentdateDash(),
            updatedDate: currentdateDash()
        }

        var latLonCon = 0
        var taxIdCon = 0
        var nameCon = 0
        var addressCon = 0

        const listLenght = []
        const dataLatLonStore = await Store.find({}, {
            storeId:1,
            latitude: 1,
            longtitude: 1,
            _id: 0,
            taxId: 1,
            name: 1,
            addressTitle: 1,
            distric: 1,
            subDistric: 1,
            province: 1,
        })
        for (const list of dataLatLonStore) {
            const dist = await checkDistanceLatLon(parseFloat(latitude), parseFloat(longtitude), parseFloat(list.latitude), parseFloat(list.longtitude), 'K')
            const dataSet = {
                storeId: list.storeId,
                distance: dist
            }
            listLenght.push(dataSet)
        }

        function levenshteinDistance(a, b) {
            const m = a.length, n = b.length;
            const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));

            for (let i = 0; i <= m; i++) {
                for (let j = 0; j <= n; j++) {
                    if (i === 0) dp[i][j] = j;
                    else if (j === 0) dp[i][j] = i;
                    else {
                        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
                        dp[i][j] = Math.min(
                            dp[i - 1][j] + 1,
                            dp[i][j - 1] + 1,
                            dp[i - 1][j - 1] + cost
                        );
                    }
                }
            }

            return dp[m][n];
        }

        function compareStrings(str1, str2) {
            const distance = levenshteinDistance(str1, str2);
            const maxLength = Math.max(str1.length, str2.length);
            const similarityPercentage = ((maxLength - distance) / maxLength) * 100;

            return similarityPercentage.toFixed(2);
        }

        const storeReplace = []
        for (const listData of listLenght) {
            if (listData.distance < 0.01) {
                const StoreFind = await Store.findOne({storeId:listData.storeId})
                const {list} = await statusDes.findOne({type: 'store', 'list.id': StoreFind.status});
                const matchedObject = _.find(list, {'id': StoreFind.status});
                console.log(matchedObject)
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

        for (const listStruc of dataLatLonStore) {
            if (!listStruc.taxId) {
                taxIdCon = 0
            } else {
                const taxCheck = await Store.findOne({taxId: listStruc.taxId})
                if (!taxCheck) {
                    taxIdCon = 0
                } else {
                    taxIdCon = 1
                }
            }

            const text1 = listStruc.name;
            const text2 = name;
            console.log(listStruc)

            const similarityPercentage = compareStrings(text1, text2);
            console.log(`Similarity Percentage: ${similarityPercentage}%`);
            if (similarityPercentage > 50) {
                nameCon = 1
            }

            const similarityPercentageAddress = compareStrings(listStruc.addressTitle + listStruc.distric + listStruc.subDistric + listStruc.province, addressTitle + distric + subDistric + province);
            if (similarityPercentageAddress > 90) {
                addressCon = 1
            }
        }

        if(latLonCon === 1){
            if(taxIdCon === 1){
                if(nameCon === 1){
                    if(addressCon === 1){

                    }else {

                    }
                }else{

                }
            }else{

            }
        }else{

        }

        if (storeReplace.length > 0) {
            res.status(200).json({
                status: 201,
                message: 'Store Replace',
                additionalData: {latLonCon, taxIdCon, nameCon, addressCon, storeReplace}
            })
        } else {
            const newStore = new Store(mainData)
            await newStore.save()
            await updateAvailable(numberSeries.type, numberSeries.zone, idAvailable + 1)
            res.status(200).json({
                status: 201, message: 'Store added successfully', additionalData: idAvailable
            })
        }
    } catch (error) {
        console.log(error)
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


        for (const splitData of data) {
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
                "storeId": splitData.storeId,
                "taxId": splitData.taxno,
                "name": splitData.customername,
                "tel": splitData.phone,
                "route": "",
                "type": splitData.customertype,
                "address": splitData.addressid + ',' + splitData.address1 + ',' + splitData.address2 + ',' + splitData.address3,
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
                status: splitData.status,
                policyConsent: poliAgree,
                "imageList": [],
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
        // res.json(data)
        res.status(200).json({status: 201, message: 'Store Added Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})


module.exports = addStore