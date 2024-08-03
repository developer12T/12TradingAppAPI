const express = require('express')
require('../../configs/connect')
const { Order } = require("../../models/order");
const { currentYear, nameMonth } = require("../../utils/utility");
const { Promotion } = require("../../models/promotion");
const { Target } = require("../../models/target");
const getDashboard = express.Router()
getDashboard.post('/getMain', async (req, res) => {
    try {
        const yearLastes = await currentYear()
        let mnthName = await nameMonth()
        let monthData = []
        let mainData2 = []
        let resData = []
        let resData2 = []

        for (let list of mnthName.month) {
            // console.log(list.counter)
            list.year = yearLastes
            monthData.push(list.nameThaiYO)
        }

        for (let list of mnthName.month) {
            // console.log(list.counter)
            list.year = yearLastes
            mainData2.push(list)
        }

        for (let list of mainData2) {
            // console.log(yearLastes+'/'+list.number)
            const summary = await Order.find({ area: req.body.area, createDate: { $regex: yearLastes + '/' + list.number, $options: 'i' } })
            list.totalSale = 0
            for (const listSub of summary) {
                // console.log(listSub.totalPrice)
                list.totalSale = listSub.totalPrice + list.totalSale
            }
            if (!list.totalSale) {
                list.totalSale = 0.00
            }
            list.totalCn = 0.00
            resData.push(list.totalSale)
        }

        const dataTarget = await Target.find({ area: req.body.area })
        console.log(dataTarget)

        let monthI = 1
        let dataSale = []
        let monthNo
        for (const listResData of resData) {
            // console.log(listResData)
            if (monthI < 10) {
                monthNo = '0' + monthI
            } else {
                monthNo = monthI
            }

            const dataObj = {
                month: monthNo.toString(),
                Sale: listResData,
            }
            dataSale.push(dataObj)
            monthI = monthI + 1
        }

        const targetSalesMap = {}
        dataTarget.forEach(item => {
            targetSalesMap[item.month] = item.targetSale;
        })

        dataSale.forEach(item => {
            // const targetSale = targetSalesMap[item.month]
            // if (targetSale !== undefined) {
            //     item.targetSale = targetSale
            // }
            const targetSale = targetSalesMap[item.month]
            item.targetSale = targetSale !== undefined ? targetSale : 0
        })

        const dataSalePercent = []
        const dataSaleNumber = []
        for (const listDataSale of dataSale) {
            if (listDataSale.Sale == 0) {
                const per = '0%'
                dataSalePercent.push(per)
                dataSaleNumber.push(0.00)
            } else {
                const per = parseFloat((listDataSale.Sale / listDataSale.targetSale) * 100).toFixed(2) + '%'
                const per2 = parseFloat((listDataSale.Sale / listDataSale.targetSale) * 100).toFixed(2)
                dataSalePercent.push(per)
                dataSaleNumber.push(parseFloat(per2))
            }
        }
        // console.log(dataSale)
        res.status(200).json({
            year: yearLastes,
            month: monthData,
            dataSale: resData,
            dataSalePercent: dataSalePercent,
            dataSalePercentNumber: dataSaleNumber,
            dataCn: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getDashboard.get('/getDetail', async (req, res) => {
    try {
        const yearLastes = await currentYear()
        let mnthName = await nameMonth()
        let mainData = []
        let mainData2 = []
        let mainData3 = []
        let resData = []
        let resData2 = []

        for (let list of mnthName.month) {
            // console.log(list.counter)
            list.year = yearLastes
            mainData2.push(list)
        }

        for (let list of mnthName.month) {
            // console.log(list.counter)
            list.year = yearLastes
            mainData3.push(list)
        }

        for (let list of mainData2) {
            // console.log(yearLastes+'/'+list.number)
            const summary = await Order.find({ createDate: { $regex: yearLastes + '/' + list.number, $options: 'i' } })
            for (const listSub of summary) {
                // console.log(listSub.totalPrice)
                list.totalSale = listSub.totalPrice
            }
            if (!list.totalSale) {
                list.totalSale = 0.00
            }
            list.totalCn = 0.00
            resData2.push(list)
        }

        res.status(200).json({ year: yearLastes, data: resData2 })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getDashboard.get('/getNews', async (req, res) => {
    try {
        const data = await Promotion.find()
        let mainData = []
        let resData = []
        let mainData_Obj = {}
        for (const list of data) {
            for (const listItemBuy of list.itembuy) {
                if (listItemBuy.productId == '') {
                    mainData_Obj = {
                        proId: list.proId,
                        name: list.name,
                        buy: listItemBuy.productGroup
                    }
                } else {
                    mainData_Obj = {
                        proId: list.proId,
                        name: list.name,
                        buy: listItemBuy.productId
                    }
                }
                mainData.push(mainData_Obj)
            }
        }
        // console.log(mainData)
        for (let listFree of mainData) {
            // console.log(list)
            const dataFree = await Promotion.findOne({ proId: listFree.proId }, {})
            // console.log(dataFree)
            listFree.free = dataFree.itemfree
            resData.push(listFree)
            console.log(resData)
        }

        res.status(200).json(resData)
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = getDashboard