/*
 * Copyright (c) 2567. by develop 12Trading
 */

const express = require('express')
require('../../configs/connect')
const {Order} = require("../../models/order")
const {errResponse} = require("../../services/errorResponse");
const {dayOfMonth, floatConvert, currentMonth, currentYear} = require("../../utils/utility");
const axios = require("axios");
const {Product, Unit} = require("../../models/product");
const {access} = require("fs");
const {createLog} = require("../../services/errorLog");
const _ = require("lodash");
const {log} = require("winston");
const getReport = express.Router()
getReport.post('/getGroupProductDetail', async (req, res) => {
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
            const preDataFree = {}
            const mergedData = {}
            const mergedDataFree = {}
            const resultRes = []
            const resultResFree = []


            const data = await Order.find({
                area, createDate: {$regex: year + '/' + month, $options: 'i'},
                list: {
                    $elemMatch: {
                        type: 'buy',
                    }
                }
            }, {
                'list.$': 1,
                _id: 0,
            })

            // const data = await Order.find({
            //     area, createDate: {$regex: year + '/' + month, $options: 'i'},
            // }, {
            //     _id: 0,
            // })

            if (data.length > 0) {
                for (const list of data) {
                    // console.log(list.list)
                    for (const listSub of list.list) {
                        dataProduct.push({
                            id: listSub.id,
                            type: listSub.type,
                            totalAmount: listSub.totalAmount,
                            qty: listSub.qty,
                            unitQty: listSub.unitQty
                        })
                        // console.log(dataProduct)
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
                            // type:item.type,
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
                            }],
                        })
                    }
                    return acc
                }, [])

                dataGroup.forEach(item2 => {
                    const matchProduct = groupedData.find(item1 => item1.group === item2.group)
                    if (matchProduct) {
                        // console.log(groupedData[0].list)
                        resultRes.push({
                            group: item2.group,
                            totalPrice: matchProduct.totalAmount,
                            // productFree: '10 ซอง',
                            list: matchProduct.list
                        })
                    } else {
                        resultRes.push({
                            group: item2.group,
                            totalPrice: 0,
                            // productFree: '0 ซอง',
                            list: []
                        })
                    }
                })

                let resultFull = []
                let resultFullList = []
                for (let mainList of resultRes) {
                    // console.log(mainList)
                    for (let list of mainList.list) {
                        const dataUnit = await Unit.findOne({idUnit: list.unitQty},)
                        list.nameQtyThai = dataUnit.nameThai
                        list.nameQtyEng = dataUnit.nameEng
                        resultFullList.push(list)
                    }
                    // console.log(mainList)
                    resultFull.push({
                        // totalQty: mainList.totalQty,
                        group: mainList.group,
                        // productFree: mainList.productFree,
                        totalPrice: mainList.totalPrice,
                        // vat: mainList.vat,
                        // summaryPrice: mainList.summaryPrice,
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
                for (let listTotalQty of formattedData) {
                    const dataUnit = await Unit.findOne({idUnit: listTotalQty.unitId},)
                    listTotalQty.nameQtyThai = dataUnit.nameThai
                    listTotalQty.nameQtyEng = dataUnit.nameEng
                    dataTotalQty.push(listTotalQty)
                }


                //********* free Item
                const dataFree = await Order.find({
                    area, createDate: {$regex: year + '/' + month, $options: 'i'},
                    list: {
                        $elemMatch: {
                            type: 'free',
                        }
                    }
                }, {
                    'list.$': 1,
                    _id: 0,
                })
                let dataFreeArr = []
                for (const list of dataFree) {
                    // console.log(list.list)
                    for (const listSub of list.list) {
                        // console.log(listSub)
                        const getGroup = await Product.findOne({id: listSub.id}, {group: 1, _id: 0})
                        // console.log(getGroup.group)
                        dataFreeArr.push({
                            group: getGroup.group,
                            id: listSub.id,
                            qty: listSub.qty,
                            unitQty: listSub.unitQty
                        })
                        // console.log(dataFreeArr)
                    }
                }

                for (const item of dataFreeArr) {
                    const key = item.id + '-' + item.group + '-' + item.unitQty
                    if (!preDataFree[key]) {
                        preDataFree[key] = {
                            id: item.id,
                            group: item.group,
                            unitQty: item.unitQty,
                            // type:item.type,
                            totalAmount: await floatConvert(item.totalAmount, 2),
                            qty: item.qty
                        };
                    } else {
                        preDataFree[key].qty += item.qty
                        preDataFree[key].totalAmount += item.totalAmount
                    }
                }

                const resultArrayFree = Object.values(preDataFree)

                resultArrayFree.forEach(item => {
                    const key = item.group + '-' + item.unitQty
                    if (!mergedDataFree[key]) {
                        mergedDataFree[key] = {totalAmount: 0, qty: 0}
                    }
                    mergedDataFree[key].totalAmount += item.totalAmount
                    mergedDataFree[key].qty += item.qty
                })

                const resultFree = Object.entries(mergedDataFree).map(([key, value]) => {
                    const [group, unitQty] = key.split('-')
                    return {group, unitQty, ...value}
                })

                // console.log(result)
                const groupedDataFree = resultFree.reduce((acc, curr) => {
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
                            }],
                        })
                    }
                    return acc
                }, [])

                dataGroup.forEach(item2 => {
                    const matchProductFree = groupedDataFree.find(item1 => item1.group === item2.group)
                    if (matchProductFree) {
                        // console.log(groupedData[0].list)
                        resultResFree.push({
                            group: item2.group,
                            totalPrice: matchProductFree.totalAmount,
                            // productFree: '10 ซอง',
                            list: matchProductFree.list
                        })
                    } else {
                        resultResFree.push({
                            group: item2.group,
                            totalPrice: 0,
                            // productFree: '0 ซอง',
                            list: []
                        })
                    }
                })

                let resultFullFree = []
                let resultFullListFree = []
                for (let mainList of resultResFree) {
                    // console.log(mainList)
                    for (let list of mainList.list) {
                        const dataUnit = await Unit.findOne({idUnit: list.unitQty},)
                        list.nameQtyThai = dataUnit.nameThai
                        list.nameQtyEng = dataUnit.nameEng
                        resultFullListFree.push(list)
                    }
                    // console.log(mainList)
                    resultFullFree.push({
                        // totalQty: mainList.totalQty,
                        group: mainList.group,
                        list: resultFullListFree
                    })
                    resultFullListFree = []
                }

                resultFullFree.forEach(function (item) {
                    item.list.forEach(function (innerItem) {
                        if (mergedListQty.hasOwnProperty(innerItem.unitQty)) {
                            mergedListQty[innerItem.unitQty] += innerItem.qty
                        } else {
                            mergedListQty[innerItem.unitQty] = innerItem.qty
                        }
                    })
                })

                // console.log(formattedData)
                // console.log("resultFullFree")
                // console.log(resultFullFree)
                // console.log("resultFullFree")
                //********* free Item

                let sumData = []
                for (let dataCom of resultFull) {
                    dataCom.listFree = []
                    sumData.push(dataCom)
                }

                sumData.forEach((item1) => {
                    resultFullFree.forEach((item2) => {
                        if (item1.group === item2.group) {
                            item1.listFree = item1.listFree.concat(item2.list);
                        }
                    });
                });

                console.log(sumData);


                let vat = await floatConvert(totalPriceSum, 2)
                // console.log("ผลรวมของ totalPrice ทั้งหมด: " + totalPriceSum);
                // res.status(200).json({
                //     totalQty: dataTotalQty,
                //     totalPrice: totalPriceSum,
                //     vat: vat,
                //     summaryPrice: totalPriceSum + vat,
                //     list: sumData
                // })
                res.status(200).json({status:200,message:'Prepare Develop!!!'})
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

getReport.post('/getDailyDetail', async (req, res) => {
    try {
      
        const {currentYear, currentMonth, dayOfMonth} = require('../../utils/utility')
        if (req.body.area === '' || !req.body.area) {
            res.status(500).json({
                status: 500,
                message: 'require area!'
            })
        } else {
            let {month, year, area,day} = req.body
            let mainData = []
            let resData = []
            let no = ''

            if (month == '') {
                month = await currentMonth()
            }
            if (year == '') {
                year = await currentYear()
            }
            // console.log(numberOfMonth)
            const dataCheck = await Order.find({
                area: area,
                createDate: {$regex: year + '/' + month+'/'+day, $options: 'i'}
            }, {})
            if (dataCheck.length > 0) {
                    const data = await Order.find({
                        area,
                        createDate: {
                            $regex: year + '/' + month + '/' + day,
                            $options: 'i'
                        }
                    }, {_id:0,id:1,storeId:1,totalPrice:1}).sort({id:1})

                res.status(200).json(data)
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
getReport.post('/getTargetProductDetail', async (req, res) => {
    try {
        const {currentYear, currentMonth, dayOfMonth} = require('../../utils/utility')
        const dataGroup = await axios.get(process.env.API_URL_IN_USE + '/cms/manage/Product/getGroupProduct')
        // console.log(dataGroup.data)
        let {month, year, area, group} = req.body
        if (month === '') {
            month = await currentMonth()
        }
        if (year === '') {
            year = await currentYear()
        }
        const dataCheck = await Order.find({createDate: {$regex: year + '/' + month, $options: 'i'}}, {})
        if (dataCheck.length > 0) {

            const dataTarget = await axios.post(process.env.API_URL_IN_USE + '/cms/manage/Target/getDetail', {
                year,
                month,
                area
            })
            const dataTargetList = _.find(dataTarget.data.data, {name: group})
            // console.log(dataTargetList.list)
            const dataFree = await Order.find({
                area, createDate: {$regex: year + '/' + month, $options: 'i'},
                list: {
                    $elemMatch: {
                        type: 'buy',
                        group: {$in: dataTargetList.list}
                    }
                }
            }, {
                'list.$': 1,
                storeId: 1,
                id: 1,
                _id: 0,
            })
            const result = {};

            dataFree.forEach(item => {
                if (!result[item.storeId]) {
                    result[item.storeId] = []
                }
                result[item.storeId].push(item.id)
            })

            const formattedResult = Object.keys(result).map(storeId => ({
                storeId: storeId,
                listOrder: result[storeId]
            }))

            let resData = []
            let OrderDetail = []

            for (const listOrder of formattedResult) {
                // console.log(listOrder)
                for (const listSub of listOrder.listOrder) {
                    // console.log(listSub)
                    const dataOrder = await Order.findOne({id: listSub})
                    const OrderDetailObj = {
                        idOrder: listSub,
                        totalPrice: dataOrder.totalPrice

                    }
                    OrderDetail.push(OrderDetailObj)
                    console.log(dataOrder)
                }
                resData.push({
                    storeId: listOrder.storeId,
                    listOrder:OrderDetail
                })
                OrderDetail = []
            }
            // console.log(formattedResult)
            if(resData.length === 0){
                res.status(200).json({status:204,message:'No Data'})
            }else{
                res.status(200).json(resData)
            }
        } else {
            await errResponse(res)
        }
    } catch (e) {
        console.log(e)
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getReport