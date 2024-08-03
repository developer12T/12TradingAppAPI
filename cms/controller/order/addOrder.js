const express = require('express')
require('../../configs/connect')
const {Order, PreOrder, Shipping} = require('../../models/order')
const addOrder = express.Router()
var _ = require('lodash')
const {Cart} = require('../../models/saleProduct')
const {User} = require('../../models/user')
const {NumberSeries} = require('../../models/numberSeries')
const {Store} = require('../../models/store')
const {History} = require('../../models/history')
const {currentdateDash, spltitString, currentdateSlash, floatConvert} = require('../../utils/utility')
const axios = require('axios')
const {createLog} = require("../../services/errorLog");
const {Product} = require("../../models/product");

// addOrder.post('/newOrder', async (req, res) => {
//     try {
//             const index = await Order.findOne({}, {idIndex: 1}).sort({idIndex: -1})
//             // console.log(index)
//             if (index === null) {
//                 var indexPlus = 1
//             } else {
//                 var indexPlus = index.idIndex + 1
//             }

//             const numberSeries = await NumberSeries.findOne({type: 'order'}, {'detail.available': 1, _id: 0})
//             const availableNumber = numberSeries.detail.available
//             const cartData = await Cart.findOne({area:req.body.area,storeId:req.body.storeId}, {'list._id': 0})
//             const userData = await User.findOne({area: req.body.area}, {})
//             const storeData = await Store.findOne({
//                 storeId: req.body.storeId
//             }, {})
//             // console.log(cartData.shipping)
//             const listProduct = []
//             let totalPrice = 0
//             for (const data of cartData.list) {
//                 const totalAmount = data.qty * data.pricePerUnitSale
//                 totalPrice = totalPrice+totalAmount
//                 // console.log(data.qty)
//                 const dataProductGroup = await Product.findOne({id:data.id},{_id:0,group:1})
//                 const listData = {
//                     id: data.id,
//                     name: data.name,
//                     group: dataProductGroup.group,
//                     type:'buy',
//                     proCode:'',
//                     qty: data.qty,
//                     pricePerQty: data.pricePerUnitSale,
//                     unitQty: data.unitId,
//                     totalAmount:totalAmount ,
//                     discount: 0
//                 }
//                 listProduct.push(listData)
//             }

//             const dataPromotion = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/summaryCompare', {
//                 area: req.body.area,
//                 storeId: req.body.storeId
//             })
//             const responseData = dataPromotion.data

//             for (const listFreePro of responseData.listFree) {
//                 for (const listFreeItem of listFreePro.listProduct) {
//                     const dataListFree = {
//                         id: listFreeItem.productId,
//                         name: listFreeItem.productName,
//                         group: listFreeItem.productName,
//                         qty: listFreeItem.qty,
//                         type: 'free',
//                         proCode: listFreePro.proCode,
//                         unitQty:listFreeItem.unitQty,
//                         nameQty: listFreeItem.unitQtyThai,
//                         qtyText: listFreeItem.qty + ' ' + listFreeItem.unitQty,
//                         pricePerQty: '0.00',
//                         discount: 0,
//                         totalAmount: '0.00'
//                     }
//                     listProduct.push(dataListFree)
//                 }
//             }

//             const mainData = {
//                  // idIndex: indexPlus,
//                 orderNo: availableNumber + 1,
//                 saleMan: userData.firstName + ' ' + userData.surName,
//                 saleCode: userData.saleCode,
//                 area:req.body.area,
//                 storeId: storeData.storeId,
//                 storeName: storeData.name,
//                 address: storeData.address + ' ' + storeData.district + ' ' + storeData.subDistrict + ' ' + storeData.province,
//                 taxID: storeData.taxId,
//                 tel: storeData.tel,
//                 totalPrice:await floatConvert(totalPrice,2),
//                 list: listProduct,
//                 shipping:cartData.shipping,
//                 status:'10',
//                 createDate:currentdateSlash(),
//                 updateDate:null
//             }
//         const createdOrder = await Order.create(mainData)
//         await Cart.deleteOne({area: req.body.area, storeId: req.body.storeId})
//         await NumberSeries.updateOne({type: 'order'}, {$set: {'detail.available': availableNumber + 1}})

//         const visitResponse = await axios.post(process.env.API_URL_IN_USE+'/cms/route/visit', {
//              case: 'sale',
//              area: req.body.area,
//              storeId: req.body.storeId,
//              idRoute: req.body.idRoute,
//             //  latitude:req.body.latitude,
//             //  longtitude:req.body.longtitude,
//              note: 'ขายสินค้าแล้ว',
//              orderId: createdOrder.orderNo
//              })
//         // console.log(fextcapi.data)
//         await History.create({
//             type: 'updateNumber',
//             collectionName: 'NumberSeries',
//             description: `update type:order zone:MBE NumberSeries:${availableNumber} date:${currentdateDash()}`
//         })
//         res.status(200).json({
//             order:{
//                 status:201,
//                 message:'Create Order Successfully'
//             },
//             visit:{
//                 status:201,
//                 message:`Visit Store : ${req.body.storeId} and OrderId : ${createdOrder._id} Success`,
//                 respone:visitResponse.data
//             }
//         })
//         await createLog('200',req.method,req.originalUrl,res.body,'newOrder Successfully!')
//         await Cart.deleteOne({area:req.body.area,storeId:req.body.storeId})
//     } catch (error) {
//         console.log(error)
//         await createLog('500',req.method,req.originalUrl,res.body,error.message)
//         res.status(500).json({
//             status:500,
//             message:error.message
//         })
//     }
// })

// addOrder.post('/newOrder', async (req, res) => {
//     try {
//         // ดึงข้อมูลจาก API /getPreOrder
//         const response = await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/getPreOrder`, req.body);
//         const preOrderData = response.data;

//         // ตรวจสอบข้อมูลที่ได้รับจาก API
//         console.log('PreOrder data:', preOrderData);

//         // ดึงข้อมูลที่จำเป็นจาก preOrderData
//         const { saleMan, storeId, storeName, address, taxID, tel, totalAmount, list = [], listFree = [], shippingAddress, shippingDate } = preOrderData;

//         // กำหนดค่า indexPlus สำหรับ orderNo ใหม่
//         const index = await Order.findOne({}, { idIndex: 1 }).sort({ idIndex: -1 });
//         const indexPlus = index ? index.idIndex + 1 : 1;

//         // ดึงหมายเลขออร์เดอร์ล่าสุดและเพิ่มค่า
//         const numberSeries = await NumberSeries.findOne({ type: 'order' }, { 'detail.available': 1, _id: 0 });
//         const availableNumber = numberSeries.detail.available;

//         // หาข้อมูลผู้ขาย
//         const userData = await User.findOne({ area: req.body.area }, {});

//         // ตรวจสอบ totalAmount ว่าเป็นตัวเลขและไม่เป็น NaN
//         const validatedTotalAmount = totalAmount && !isNaN(totalAmount) ? parseFloat(totalAmount) : 0;

//         // ตรวจสอบ list และ listFree
//         if (!Array.isArray(list) || !Array.isArray(listFree)) {
//             return res.status(400).json({
//                 status: 400,
//                 message: 'Invalid data format for list or listFree.'
//             });
//         }

//         // ตรวจสอบว่ามีสินค้าหรือไม่
//         if (list.length === 0 && listFree.length === 0) {
//             return res.status(400).json({
//                 status: 400,
//                 message: 'No products in the order.'
//             });
//         }

//         // สร้างข้อมูลการสั่งซื้อ
//         const mainData = {
//             orderNo: (availableNumber + 1).toString(), // เพิ่มค่า availableNumber
//             saleMan: saleMan,
//             saleCode: userData ? userData.saleCode : '',
//             area: req.body.area,
//             storeId: storeId,
//             storeName: storeName,
//             address: address,
//             taxID: taxID,
//             tel: tel,
//             totalPrice: validatedTotalAmount.toFixed(2), // ใช้ค่า validatedTotalAmount ที่ตรวจสอบแล้ว
//             list: [...list, ...listFree], // รวม list และ listFree เข้าด้วยกัน
//             shipping: {
//                 address: shippingAddress,
//                 dateShip: shippingDate,
//                 note: '' // สามารถเพิ่มข้อมูลโน้ตได้ถ้ามี
//             },
//             status: '10', // สถานะสั่งซื้อ
//             createDate: currentdateSlash(),
//             updateDate: null
//         };
        
//         console.log('create',mainData);
//         // บันทึกข้อมูลการสั่งซื้อ
//         const createdOrder = await Order.create(mainData);
        
//         // ลบข้อมูลตะกร้าสินค้าหลังจากสร้างคำสั่งซื้อ
//         await Cart.deleteOne({ area: req.body.area, storeId: req.body.storeId });
        
//         // อัปเดตหมายเลขออร์เดอร์ใน NumberSeries
//         await NumberSeries.updateOne({ type: 'order' }, { $set: { 'detail.available': availableNumber + 1 } });

//         // บันทึกข้อมูลการเข้าร้าน
//         const visitResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/route/visit`, {
//             case: 'sale',
//             area: req.body.area,
//             storeId: req.body.storeId,
//             idRoute: req.body.idRoute,
//             note: 'ขายสินค้าแล้ว',
//             orderId: createdOrder.orderNo
//         });

//         // สร้างบันทึกประวัติการปรับปรุงหมายเลข
//         await History.create({
//             type: 'updateNumber',
//             collectionName: 'NumberSeries',
//             description: `update type:order zone:MBE NumberSeries:${availableNumber} date:${currentdateDash()}`
//         });

//         res.status(200).json({
//             order: {
//                 status: 201,
//                 message: 'Create Order Successfully'
//             },
//             visit: {
//                 status: 201,
//                 message: `Visit Store: ${req.body.storeId} and OrderId: ${createdOrder._id} Success`,
//                 response: visitResponse.data
//             }
//         });

//         await createLog('200', req.method, req.originalUrl, res.body, 'newOrder Successfully!');
//     } catch (error) {
//         console.log(error);
//         await createLog('500', req.method, req.originalUrl, res.body, error.message);
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// });

// addOrder.post('/newOrder', async (req, res) => {
//     try {
//         const preOrderResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/getPreOrder`, {
//             area: req.body.area,
//             storeId: req.body.storeId,
//             saleCode: req.body.saleCode
//         });
//         const preOrderData = preOrderResponse.data;

//         console.log('PreOrder data:', preOrderData);

//         const { area, storeId, idRoute } = req.body;
//         const { saleMan, storeName, address, taxID, tel, totalAmount, discount, list, listFree, shippingAddress, shippingDate } = preOrderData;

//         const numberSeries = await NumberSeries.findOne({ type: 'order' }, { 'detail.available': 1, _id: 0 });
//         const availableNumber = numberSeries ? numberSeries.detail.available : 0;
//         const orderNo = (availableNumber + 1).toString();

//         if (!Array.isArray(list) || !Array.isArray(listFree) || (list.length === 0 && listFree.length === 0)) {
//             return res.status(400).json({
//                 status: 400,
//                 message: 'Invalid or missing product data.'
//             });
//         }

//         const mainData = {
//             orderNo: orderNo,
//             saleMan: saleMan,
//             saleCode: req.body.saleCode,
//             area: area,
//             storeId: storeId,
//             storeName: storeName,
//             address: address,
//             taxID: taxID,
//             tel: tel,
//             totalPrice: parseFloat(parseFloat(totalAmount).toFixed(2)),
//             totalDiscount: parseFloat(parseFloat(discount).toFixed(2)),
//             list: [...list, ...listFree],
//             shipping: {
//                 address: shippingAddress,
//                 dateShip: shippingDate,
//                 note: ''
//             },
//             status: '10',
//             createDate: currentdateSlash(),
//             updateDate: null
//         };

//         // บันทึกข้อมูลการสั่งซื้อ
//         const createdOrder = await Order.create(mainData);

//         // ลบข้อมูลตะกร้าสินค้าหลังจากสร้างคำสั่งซื้อ
//         await Cart.deleteOne({ area: req.body.area, storeId: req.body.storeId });

//         // อัปเดตหมายเลขออร์เดอร์ใน NumberSeries
//         await NumberSeries.updateOne({ type: 'order' }, { $set: { 'detail.available': availableNumber + 1 } });

//         // บันทึกข้อมูลการเข้าร้าน
//         const visitResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/route/visit`, {
//             case: 'sale',
//             area: req.body.area,
//             storeId: req.body.storeId,
//             idRoute: req.body.idRoute,
//             note: 'ขายสินค้าแล้ว',
//             orderId: orderNo
//         });

//         res.status(200).json({
//             status: 201,
//             message: 'Create Order Successfully',
//             order: createdOrder,
//             visit: visitResponse.data
//         });
//         // res.status(200).json(mainData)
//         await createLog('200', req.method, req.originalUrl, res.body, 'newOrder Successfully!');
//     } catch (error) {
//         console.log(error);
//         await createLog('500', req.method, req.originalUrl, res.body, error.message);
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// });

addOrder.post('/newOrder', async (req, res) => {
    try {
        const preOrderResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/saleProduct/getPreOrder`, {
            area: req.body.area,
            storeId: req.body.storeId,
            saleCode: req.body.saleCode
        });
        const preOrderData = preOrderResponse.data;

        console.log('PreOrder data:', preOrderData);

        const { area, storeId, idRoute, warehouse } = req.body;
        const { saleMan, storeName, address, taxID, tel, totalAmount, discount, list, listFree, shippingAddress, shippingDate } = preOrderData;

        // ดึงหมายเลขออร์เดอร์จาก external API
        const seriesResponse = await axios.post('http://192.168.2.97:8383/M3API/OrderManage/Order/getNumberSeries', {
            series: "ฃ",
            seriestype: "01",
            companycode: 410,
            seriesname: "0"
        });

        const seriesData = seriesResponse.data[0];
        const availableNumber = seriesData.lastno;
        const orderNo = (availableNumber + 1).toString();

        if (!Array.isArray(list) || !Array.isArray(listFree) || (list.length === 0 && listFree.length === 0)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid or missing product data.'
            });
        }

        const mainData = {
            orderNo: orderNo,
            saleMan: saleMan,
            saleCode: req.body.saleCode,
            area: area,
            storeId: storeId,
            storeName: storeName,
            address: address,
            taxID: taxID,
            tel: tel,
            warehouse: warehouse,
            totalPrice: parseFloat(parseFloat(totalAmount).toFixed(2)),
            totalDiscount: parseFloat(parseFloat(discount).toFixed(2)),
            list: [...list, ...listFree],
            shipping: {
                address: shippingAddress,
                dateShip: shippingDate,
                note: ''
            },
            status: '10',
            createDate: currentdateSlash(),
            updateDate: null
        };

        // บันทึกข้อมูลการสั่งซื้อ
        const createdOrder = await Order.create(mainData);

        // ลบข้อมูลตะกร้าสินค้าหลังจากสร้างคำสั่งซื้อ
        await Cart.deleteOne({ area: req.body.area, storeId: req.body.storeId });

        // อัปเดตหมายเลขออร์เดอร์ใน external API
        await axios.post('http://192.168.2.97:8383/M3API/OrderManage/Order/updateNumberRunning', {
            lastno: orderNo,
            series: "ฃ",
            seriesname: "0",
            seriestype: "01",
            companycode: 410
        });

        // บันทึกข้อมูลการเข้าร้าน
        const visitResponse = await axios.post(`${process.env.API_URL_IN_USE}/cms/route/visit`, {
            case: 'sale',
            area: req.body.area,
            storeId: req.body.storeId,
            idRoute: req.body.idRoute,
            note: 'ขายสินค้าแล้ว',
            orderId: orderNo
        });

        res.status(200).json({
            status: 201,
            message: 'Create Order Successfully',
            order: createdOrder,
            visit: visitResponse.data
        });
        await createLog('200', req.method, req.originalUrl, res.body, 'newOrder Successfully!');
    } catch (error) {
        console.log(error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});


addOrder.post('/addShipment', async (req, res) => {
    try {
        // const data = await PreOrder.findOne({ id: req.body.idPreOrder }, {_id: 0, idIndex: 0, __v: 0, 'list._id': 0})
        const shlist = {
            id: req.body.idPreOrder,
            address: req.body.address,
            dateShip: req.body.dateShip,
            note: req.body.note
        }

        // const dataList = {
        //     id:data.id,
        //     saleMan: data.saleMan,
        //     storeId: data.storeId,
        //     storeName:data.storeName,
        //     address:data.address,
        //     taxID:data.taxID,
        //     tel:data.tel,
        //     list:data.list,
        //     shipment:shlist
        // }

        await Shipping.create(shlist)
        await createLog('200',req.method,req.originalUrl,res.body,'Successfully Add Shipment')

        res.status(200).json({status: 200, message: 'Successfully Add Shipment'})
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

addOrder.post('/getShipment', async (req, res) => {
    try {
        if (req.body.selection === 'All') {
            const data = await Shipping.find()
            await createLog('200',req.method,req.originalUrl,res.body,'getShipment All Successfully!')
            res.status(200).json(data)
        } else if (req.body.selection === 'filter') {
            const data = await Shipping.findOne({id: req.body.id})
            await createLog('200',req.method,req.originalUrl,res.body,'getShipment filter Successfully!')
            res.status(200).json(data)
        } else {
            await createLog('501',req.method,req.originalUrl,res.body,'Require selection or id!!!')
            res.status(501).json({status: 501, message: 'Require selection or id!!!'})
        }
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({status: 500, message: error.message})
    }
})

module.exports = addOrder