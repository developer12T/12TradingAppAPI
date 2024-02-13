const express = require('express')
require('../../configs/connect')
const {Order} = require("../../models/order")
const {errResponse} = require("../../services/errorResponse");
const {dayOfMonth, floatConvert, currentMonth, currentYear} = require("../../utils/utility");
const axios = require("axios");
const {Product, Unit} = require("../../models/product");
const getReport = express.Router()
getReport.post('/getGroupProduct', async (req, res) => {
    try {
        if (req.body.area === '' || !req.body.area) {
            res.status(500).json({
                status: 500,
                message: 'require area!'
            })
        } else {
            const {year, month, area} = req.body
            const getGroup = await axios.get(process.env.API_URL_IN_USE + '/cms/manage/Product/getGroupProduct')
            let dataGroup = getGroup.data
            let dataProduct = []
            let dataProductGroup = []
            let totalPriceSum = 0
            let mergedListQty = {}
            const preData = {}
            const mergedData = {}
            const resultRes = []


            const data = await Order.find({area, createDate: {$regex: year + '/' + month, $options: 'i'}}, {
                list: 1,
                _id: 0
            })

            if (data.length > 0) {
                for (const list of data) {
                    // console.log(list.list)
                    for (const listSub of list.list) {
                        dataProduct.push({
                            id: listSub.id,
                            totalAmount: listSub.totalAmount,
                            qty: listSub.qty,
                            unitQty: listSub.unitQty
                        })
                    }
                }
                // console.log(dataProduct)
                for (let listProduct of dataProduct) {
                    const dataFindProduct = await Product.findOne({id: listProduct.id}, {group: 1, _id: 0})
                    // console.log(dataFindProduct)
                    listProduct.group = dataFindProduct.group
                    dataProductGroup.push(listProduct)
                }

                for (const item of dataProductGroup) {
                    const key = item.id + '-' + item.group + '-' + item.unitQty
                    if (!preData[key]) {
                        preData[key] = {
                            id: item.id,
                            group: item.group,
                            unitQty: item.unitQty,
                            totalAmount: await floatConvert(item.totalAmount, 2),
                            qty: item.qty
                        };
                    } else {
                        preData[key].qty += item.qty
                        preData[key].totalAmount += item.totalAmount
                    }
                }
                const resultArray = Object.values(preData)
                // console.log(resultArray)

                resultArray.forEach(item => {
                    const key = item.group + '-' + item.unitQty
                    if (!mergedData[key]) {
                        mergedData[key] = {totalAmount: 0, qty: 0}
                    }
                    mergedData[key].totalAmount += item.totalAmount
                    mergedData[key].qty += item.qty
                })

                const result = Object.entries(mergedData).map(([key, value]) => {
                    const [group, unitQty] = key.split('-')
                    return {group, unitQty, ...value}
                })

                // console.log(result)
                const groupedData = result.reduce((acc, curr) => {
                    const existingItem = acc.find(item => item.group === curr.group)
                    if (existingItem) {
                        existingItem.totalAmount += curr.totalAmount
                        existingItem.list.push({
                            unitQty: curr.unitQty,
                            qty: curr.qty
                        })
                    } else {
                        acc.push({
                            group: curr.group,
                            totalAmount: curr.totalAmount,
                            list: [{
                                unitQty: curr.unitQty,
                                qty: curr.qty
                            }]
                        })
                    }
                    return acc
                }, [])

                dataGroup.forEach(item2 => {
                    const matchProduct = groupedData.find(item1 => item1.group === item2.group)
                    if (matchProduct) {
                        resultRes.push({
                            group: item2.group,
                            totalPrice: matchProduct.totalAmount,
                            list: matchProduct.list
                        })
                    } else {
                        resultRes.push({group: item2.group, totalPrice: 0, list: []})
                    }
                })

                let resultFull = []
                let resultFullList = []
                for (let mainList of resultRes) {
                    for (let list of mainList.list) {
                        const dataUnit = await Unit.findOne({idUnit: list.unitQty},)
                        list.nameQtyThai = dataUnit.nameThai
                        list.nameQtyEng = dataUnit.nameEng
                        resultFullList.push(list)
                    }
                    // console.log(mainList)
                    resultFull.push({
                        totalQty: mainList.totalQty,
                        group: mainList.group,
                        totalPrice: mainList.totalPrice,
                        vat: mainList.vat,
                        summaryPrice: mainList.summaryPrice,
                        list: resultFullList
                    })
                    resultFullList = []
                }
                resultFull.forEach(function (item) {
                    totalPriceSum += item.totalPrice
                })

                resultFull.forEach(function (item) {
                    item.list.forEach(function (innerItem) {
                        if (mergedListQty.hasOwnProperty(innerItem.unitQty)) {
                            mergedListQty[innerItem.unitQty] += innerItem.qty
                        } else {
                            mergedListQty[innerItem.unitQty] = innerItem.qty
                        }
                    })
                })

                let formattedData = []
                for (let key in mergedListQty) {
                    if (mergedListQty.hasOwnProperty(key)) {
                        formattedData.push({
                            unitId: key,
                            qty: mergedListQty[key]
                        })
                    }
                }
                // console.log(formattedData)

                let dataTotalQty = []
                for(let listTotalQty of formattedData){
                    const dataUnit = await Unit.findOne({idUnit: listTotalQty.unitId},)
                    listTotalQty.nameQtyThai = dataUnit.nameThai
                    listTotalQty.nameQtyEng = dataUnit.nameEng
                    dataTotalQty.push(listTotalQty)
                }

                let vat = await floatConvert(totalPriceSum, 2)
                // console.log("ผลรวมของ totalPrice ทั้งหมด: " + totalPriceSum);
                res.status(200).json({
                    totalQty: dataTotalQty,
                    totalPrice: totalPriceSum,
                    vat: vat,
                    summaryPrice: totalPriceSum + vat,
                    list: resultFull
                })
            } else {
                await errResponse(res)
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getReport.post('/getDaily', async (req, res) => {
    try {
        const {currentYear, currentMonth, dayOfMonth} = require('../../utils/utility')
        if (req.body.area === '' || !req.body.area) {
            res.status(500).json({
                status: 500,
                message: 'require area!'
            })
        } else {
            let {month, year, area} = req.body
            let mainData = []
            let resData = []
            let no = ''

            if (month == '') {
                month = await currentMonth()
            }
            if (year == '') {
                year = await currentYear()
            }
            const numberOfMonth = await dayOfMonth(month)
            // console.log(numberOfMonth)
            const dataCheck = await Order.find({
                area: area,
                createDate: {$regex: year + '/' + month, $options: 'i'}
            }, {})
            if (dataCheck.length > 0) {
                for (let i = 1; i <= parseInt(numberOfMonth.numberOfDay); i++) {
                    // console.log(i)
                    if (i > 9) {
                        no = i
                    } else {
                        no = '0' + i
                    }
                    const data = await Order.find({
                        area,
                        createDate: {
                            $regex: year + '/' + month + '/' + no,
                            $options: 'i'
                        }
                    }, {})
                    mainData.push({
                        year,
                        month,
                        day: no.toString(),
                        list: data
                    })
                }

                for (let listMainData of mainData) {
                    let total = 0
                    listMainData.list.forEach(list => {
                        total += list.totalPrice
                        listMainData.totalPrice = total
                    })
                    delete listMainData.list
                    if (listMainData.totalPrice) {

                    } else {
                        listMainData.totalPrice = 0.00
                    }
                    listMainData.sendMoney = null
                    resData.push(listMainData)
                }
                console.log(resData)
                let totalMonth = 0
                resData.forEach(item => {
                    totalMonth += item.totalPrice;
                })
                let vatPer = await floatConvert(totalMonth * 0.07, 2)
                res.status(200).json({
                    totalPrice: totalMonth,
                    vat: vatPer,
                    totalSummary: totalMonth - vatPer,
                    targetMonth: null,
                    list: resData
                })
            } else {
                await errResponse(res)
            }
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})
getReport.post('/getScatter', async (req, res) => {
    try {
        const {currentYear, currentMonth, dayOfMonth} = require('../../utils/utility')
        const dataGroup = await axios.get(process.env.API_URL_IN_USE + '/cms/manage/Product/getGroupProduct')
        console.log(dataGroup.data)

        let {month, year} = req.body
        if (month == '') {
            month = await currentMonth()
        }
        if (year == '') {
            year = await currentYear()
        }
        const dataCheck = await Order.find({createDate: {$regex: year + '/' + month, $options: 'i'}}, {})
        if (dataCheck.length > 0) {

            res.status(200).json(dataCheck)
        } else {
            await errResponse(res)
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})
module.exports = getReport