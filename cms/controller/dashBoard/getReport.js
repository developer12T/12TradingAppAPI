const express = require('express')
require('../../configs/connect')
const {Order} = require("../../models/order")
const {errResponse} = require("../../services/errorResponse");
const {dayOfMonth, floatConvert, currentMonth, currentYear} = require("../../utils/utility");
const axios = require("axios");
const {Product, Unit} = require("../../models/product");
const {access} = require("fs");
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
                res.status(200).json({
                    totalQty: dataTotalQty,
                    totalPrice: totalPriceSum,
                    vat: vat,
                    summaryPrice: totalPriceSum + vat,
                    list: sumData
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
        // console.log(dataGroup.data)
        let {month, year, area} = req.body
        const dataTarget = await axios.post(process.env.API_URL_IN_USE + '/cms/manage/Target/getDetail', {year, month})
        // console.log(dataTarget.data)
        if (month === '') {
            month = await currentMonth()
        }
        if (year === '') {
            year = await currentYear()
        }
        const dataCheck = await Order.find({createDate: {$regex: year + '/' + month, $options: 'i'}}, {})
        if (dataCheck.length > 0) {

            const dataFree = await Order.find({
                area, createDate: {$regex: year + '/' + month, $options: 'i'},
                list: {
                    $elemMatch: {
                        type: 'buy',
                    }
                }
            }, {
                'list.$': 1,
                storeId: 1,
                _id: 0,
            })

            // console.log(dataFree)

            const summaryDataOrder = dataFree.reduce((acc, store) => {
                const existingStore = acc.find((s) => s.storeId === store.storeId)

                if (existingStore) {
                    existingStore.list = existingStore.list.concat(store.list)
                } else {
                    acc.push(store)
                }

                return acc
            }, [])

            // console.log(summaryDataOrder)
            let rdDataOrder = []
            let mainDataOrder = []
            for (const listMain of summaryDataOrder) {
                for (const listSub of listMain.list) {
                    const dataGroupProduct = await Product.findOne({id: listSub.id})
                    rdDataOrder.push({
                        id: listSub.id,
                        group: dataGroupProduct.group,
                        qty: listSub.qty,
                        unitQty: listSub.unitQty,
                    })
                }
                mainDataOrder.push({storeId: listMain.storeId, list: rdDataOrder})
                rdDataOrder = []
            }
            // console.log(mainDataOrder)
            const processedData = {};

            mainDataOrder.forEach(store => {
                const {storeId, list} = store
                if (!processedData[storeId]) {
                    processedData[storeId] = []
                }
                const map = {}
                list.forEach(item => {
                    const {id, group, qty, unitQty} = item
                    const key = `${id}-${group}-${unitQty}`

                    if (map[key]) {
                        map[key].qty += qty
                    } else {
                        map[key] = {id, group, qty, unitQty}
                    }
                })
                processedData[storeId] = Object.values(map)
            })

            // console.log(processedData);
            let resultSum = {}
            let resultSumArr = []

            Object.keys(processedData).forEach((storeId) => {
                resultSum = {
                    storeId,
                    list: processedData[storeId],
                }
                resultSumArr.push(resultSum)
            })

            // console.log(resultSumArr)
            // console.log(dataTarget.data.data)
            let combinedData = []
            let data_Arr = []
            for(const list of dataTarget.data.data){
                data_Arr.push({name: list.name, targetMarket: list.targetMarket,targetQty: list.targetQty, list: list.list})
            }

            for (const group1 of data_Arr) {
                // console.log(group.list)
                for(const group of group1.list){
                    const groupName = group;
                    let groupQty = 0;
                    const groupListStore = []
                    for (const store of resultSumArr) {
                        for (const item of store.list) {
                            if (item.group === groupName) {
                                groupQty += item.qty;
                                groupListStore.push(store.storeId)
                            }
                        }
                    }
                    combinedData.push({
                        group:group1.name,
                        targetMarket: group1.targetMarket,
                        targetQty: group1.targetQty,
                        qty: groupQty,
                        // listStore: groupListStore,
                    })
                }
            }
            // console.log(combinedData)

            const preData = [];
            const groupMap = new Map();

            for (const item of combinedData) {
                const group = item.group;
                if (!groupMap.has(group)) {
                    groupMap.set(group, {
                        group,
                        targetMarket: item.targetMarket,
                        targetQty: item.targetQty,
                        qty: 0,
                        listStore: []
                    });
                }
                const groupData = groupMap.get(group);
                groupData.qty += item.qty;
                groupData.listStore.push(...item.listStore);
            }

            for (const groupData of groupMap.values()) {
                preData.push(groupData);
            }

            console.log(preData)
            // let productArr = []
            // for (const listLeg of summaryDataOrder) {
            //     for (const listSubLeg of listLeg.list) {
            //         const dataGroupProduct = await Product.findOne({id: listSubLeg.id})
            //         productArr.push({
            //             id: listSubLeg.id,
            //             group: dataGroupProduct.group,
            //             qty: listSubLeg.qty,
            //             unitQty: listSubLeg.unitQty,
            //             totalAmount: listSubLeg.totalAmount
            //         })
            //     }
            // }
            // console.log(productArr)

            // let data_Arr = []
            // for (const list of dataTarget.data.data) {
            //     // console.log(list)
            //     data_Arr.push({name: list.name, target: list.TargetBalance, list: list.list})
            // }
            //
            // const result = data_Arr.map((group) => {
            //     const groupData = productArr.filter((item) => group.list.includes(item.group))
            //     const totalAmount = groupData.reduce((sum, item) => sum + item.totalAmount, 0)
            //
            //     return {
            //         name: group.name,
            //         targetMarket: group.targetMarket,
            //         targetQty: group.targetQty,
            //         sales: totalAmount,
            //         percentDif: parseFloat((totalAmount / group.target) * 100).toFixed(2) + '%'
            //     }
            // })
            // // console.log(result)

            // res.status(200).json(dataFree)
            let resData = []
            for(let rData of preData){
                rData.numberStore = rData.listStore.length
                resData.push(rData)
            }
            res.status(200).json(resData)
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