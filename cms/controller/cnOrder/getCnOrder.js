const express = require('express')
require('../../configs/connect')
const {createLog} = require("../../services/errorLog")
const {CnOrder} = require("../../models/cnOrder")
const {Unit} = require("../../models/product")
const {errResponse} = require("../../services/errorResponse")
const {getNameStatus, slicePackSize} = require("../../utils/utility");
const getCnOrder = express.Router()

getCnOrder.get('/getAll', async (req, res) => {
    try {
        const data = await CnOrder.find()
        if(data.length > 0){
            await createLog('200', req.method, req.originalUrl, res.body, 'GetAll Cn Successfully!')
            res.status(200).json(data)
        }else{
            await createLog('204', req.method, req.originalUrl, res.body, 'No Data')
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

getCnOrder.post('/getMain', async (req, res) => {
    try {
        const { area } = req.body
        const data = await CnOrder.find({area},{_id:0,__v:0,idIndex:0}).sort({id:-1})
        if(data.length > 0){
            const mainData = []
            for(let list of data){
                // const nameSt = await status.findOne({type:"order",list: {$elemMatch:{'id':list.status}}},{list:1})
                mainData.push({
                    orderDate:list.createDate,
                    number:list.orderNo,
                    name:list.storeName,
                    totalPrice:list.totalPrice,
                    status:list.status,
                    statusText: (await getNameStatus('cn', list.status)).name
                })
            }
            console.log(mainData);
            await createLog('200',req.method,req.originalUrl,res.body,'getAll Cn Successfully!')
            res.status(200).json(mainData)
        }else{
            await createLog('204',req.method,req.originalUrl,res.body,'No Data')
            res.status(204).json({status:204,message:'No Data'})
        }
    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

// getCnOrder.post('/getDetail', async (req, res) => {
//     try {
//         const data = await CnOrder.findOne({})
//         if(data){
//             await createLog('200', req.method, req.originalUrl, res.body, 'GetAll Cn Successfully!')
//             res.status(200).json(data)
//         }else{
//             await createLog('204', req.method, req.originalUrl, res.body, 'No Data')
//             await errResponse(res)
//         }
//     } catch (e) {
//         console.log(e)
//         await createLog('500', req.method, req.originalUrl, res.body, e.message)
//         res.status(500).json({
//             status: 500,
//             message: e.message
//         })
//     }
// })

getCnOrder.post('/getDetail', async (req, res) => {
    try {
        var discount = 0;
        const { orderNo } = req.body;
        
        const data = await CnOrder.findOne({orderNo},{_id:0,__v:0,idIndex:0}).sort({orderNo:-1});
        if (data) {
            console.log(data)
            const data_list = [];
            for (let list of data.list) {
                const detail_product = await Unit.findOne({idUnit: list.unitId});
                const list_obj = {
                    id: list.id,
                    name: slicePackSize(list.name),
                    nameDetail: list.name,
                    qty: list.qty,
                    qtyText: list.qty + ' ' + detail_product.nameThai,
                    unitId: list.unitId,
                    unitTypeThai: detail_product.nameThai,
                    unitTypeEng: detail_product.nameEng,
                    // itemDiscount: list.discount,
                    pricePerQty: list.pricePerUnitRefund.toFixed(2),
                    summaryPrice: list.totalAmount.toFixed(2),
                    // summaryPrice: parseFloat(list.pricePerQty * list.qty).toFixed(2),
                };
                discount += list.discount;
                data_list.push(list_obj);
            }

            const totalExVat = parseFloat((data.totalPrice / 1.07).toFixed(2));
            const totalVat = parseFloat((data.totalPrice - totalExVat).toFixed(2));
            const mainData = {
                orderDate: data.createDate,
                orderNo: data.orderNo,
                name: data.storeName,
                address: data.address,
                tax: data.taxID,
                tel: data.tel,
                saleMan: data.saleMan,
                totalPrice: data.totalPrice.toFixed(2),
                totalExVat: totalExVat,
                totalVat: totalVat,
                totalDiscount: parseFloat(discount).toFixed(2),
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