const express = require('express')
require('../../configs/connect')
const { createLog } = require("../../services/errorLog")
const { CnOrder } = require("../../models/cnOrder")
const { Unit } = require("../../models/product")
const { errResponse } = require("../../services/errorResponse")
const { getNameStatus, slicePackSize, convertDateFormat } = require("../../utils/utility")
const getCnOrder = express.Router()

getCnOrder.get('/getAll', async (req, res) => {
    try {
        const data = await CnOrder.aggregate([
            {$match:{status:"10"}},
            { $unwind: "$list" },
            {
                $lookup: {
                    from: "products",
                    let: { productId: "$list.id", unitId: "$list.unitQty" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$id", "$$productId"] } } },
                        { $unwind: "$convertFact" },
                        { $match: { $expr: { $eq: ["$convertFact.unitId", "$$unitId"] } } },
                        { $project: { factor: "$convertFact.factor", _id: 0 } }
                    ],
                    as: "productDetails"
                }
            },
            {
                $lookup: {
                    from: "units",
                    localField: "list.unitQty",
                    foreignField: "idUnit",
                    as: "unitDetails"
                }
            },
            {
                $unwind: {
                    path: "$productDetails",
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $addFields: {
                    "list.unitText": { $arrayElemAt: ["$unitDetails.nameEng", 0] },
                    note: { $ifNull: ["$note", ""] },
                    "list.qtyPcs": {
                        $multiply: [{ $ifNull: ["$list.qty", 0] }, { $ifNull: ["$productDetails.factor", 1] }]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id", 
                    orderNo: { $first: "$orderNo" },
                    saleMan: { $first: "$saleMan" },
                    saleCode: { $first: "$saleCode" },
                    area: { $first: "$area" },
                    storeId: { $first: "$storeId" },
                    storeName: { $first: "$storeName" },
                    address: { $first: "$address" },
                    taxID: { $first: "$taxID" },
                    tel: { $first: "$tel" },
                    warehouse: { $first: "$warehouse" },
                    note: { $first: "$note" },
                    totalAmount: { $first: "$totalAmount" },
                    status: { $first: "$status" },
                    createDate: { $first: "$createDate" },
                    list: { $push: "$list" } 
                }
            },
            {
                $project: {
                    _id: 0,
                    __v: 0,
                    idIndex: 0,
                }
            }
        ]).exec();

        const mainData = data.map(order => ({
            ...order,
            createDate: convertDateFormat(order.createDate)
        }));

        mainData.sort((a, b) => parseInt(a.orderNo) - parseInt(b.orderNo))

        await createLog('200', req.method, req.originalUrl, res.body, 'getAll Order Successfully!')
        res.status(200).json(mainData);

    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getCnOrder.post('/getMain', async (req, res) => {
    try {
        const { area } = req.body
        const data = await CnOrder.find({ area }, { _id: 0, __v: 0, idIndex: 0 }).sort({ id: -1 })
        if (data.length > 0) {
            const mainData = []
            for (let list of data) {
                // const nameSt = await status.findOne({type:"order",list: {$elemMatch:{'id':list.status}}},{list:1})
                mainData.push({
                    orderDate: list.createDate,
                    number: list.orderNo,
                    name: list.storeName,
                    totalAmount: list.totalAmount,
                    status: list.status,
                    statusText: (await getNameStatus('cn', list.status)).name
                })
            }
            console.log(mainData);
            await createLog('200', req.method, req.originalUrl, res.body, 'getAll Cn Successfully!')
            res.status(200).json(mainData)
        } else {
            await createLog('204', req.method, req.originalUrl, res.body, 'No Data')
            res.status(204).json({ status: 204, message: 'No Data' })
        }
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

getCnOrder.post('/getDetail', async (req, res) => {
    try {
        const { orderNo } = req.body;

        const data = await CnOrder.findOne({ orderNo }, { _id: 0, __v: 0, idIndex: 0 }).sort({ orderNo: -1 });
        if (data) {
            console.log('cn',data)
            const data_list = [];
            for (let list of data.list) {
                const detail_product = await Unit.findOne({ idUnit: list.unitQty });
                const list_obj = {
                    id: list.id,
                    name: slicePackSize(list.name),
                    nameDetail: list.name,
                    qty: list.qty,
                    qtyText: list.qty + ' ' + detail_product.nameThai,
                    unitId: list.unitQty,
                    unitTypeThai: detail_product.nameThai,
                    unitTypeEng: detail_product.nameEng,
                    pricePerQty: list.pricePerQty.toFixed(2),
                    summaryPrice: list.amount.toFixed(2),
                    note: ''
                }
                data_list.push(list_obj);
            }

            const totalExVat = parseFloat((data.totalAmount / 1.07).toFixed(2));
            const totalVat = parseFloat((data.totalAmount - totalExVat).toFixed(2));
            const mainData = {
                orderDate: data.createDate,
                orderNo: data.orderNo,
                name: data.storeName,
                address: data.address,
                tax: data.taxID,
                tel: data.tel,
                saleMan: data.saleMan,
                totalAmount: data.totalAmount.toFixed(2),
                totalExVat: totalExVat,
                totalVat: totalVat,
                status: data.status,
                statusText: (await getNameStatus('cn', data.status)).name,
                list: data_list,
            };

            await createLog('200', req.method, req.originalUrl, res.body, 'get Cn Order Detail Successfully!');
            res.status(200).json(mainData);
        } else {
            await createLog('204', req.method, req.originalUrl, res.body, 'No Data');
            res.status(200).json({ status: 204, message: 'No Data' });
        }
    } catch (e) {
        await createLog('500', req.method, req.originalUrl, res.body, e.message);
        res.status(500).json({
            status: 500,
            message: e.message,
        });
    }
});

module.exports = getCnOrder