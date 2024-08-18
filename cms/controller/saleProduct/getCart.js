const express = require('express')
require('../../configs/connect')
const { Cart } = require("../../models/saleProduct")
const { Store } = require("../../models/store")
const { Unit, Product } = require("../../models/product")
const { User } = require("../../models/user")
const _ = require('lodash')
const { createLog } = require("../../services/errorLog");
const axios = require("axios");
const getCart = express.Router()
const { slicePackSize } = require('../../utils/utility')

getCart.post('/getCart', async (req, res) => {
    try {
        const data = await Cart.find({ area: req.body.area, storeId: req.body.storeId },{_id:0})
        await createLog('200', req.method, req.originalUrl, res.body, 'getCart successfully')
        res.status(200).json(data)
    } catch (e) {
        await createLog('500', res.method, req.originalUrl, res.e, error.stack)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})
getCart.post('/getCartToShow', async (req, res) => {
    try {
        var totalAmount = 0
        const data = await Cart.findOne({ area: req.body.area, storeId: req.body.storeId })
        if (data) {
            // console.log('ไม่พบ')
            // console.log(data)
            const data_arr = []
            for (let i = 0; i < data.list.length; i++) {

                const detail_product = await Unit.findOne({ idUnit: data.list[i].unitId })
                const list_obj = {
                    id: data.list[i].id,
                    name: slicePackSize(data.list[i].name),
                    nameDetail: data.list[i].name,
                    qtyText: data.list[i].qty + ' ' + detail_product.nameThai,
                    qty: data.list[i].qty,
                    unitId: data.list[i].unitId,
                    unitTypeThai: detail_product.nameThai,
                    unitTypeEng: detail_product.nameEng,
                    summaryPrice: parseFloat(data.list[i].pricePerUnitSale * data.list[i].qty).toFixed(2)
                }
                totalAmount = totalAmount + (data.list[i].pricePerUnitSale * data.list[i].qty)
                data_arr.push(list_obj)
            }

            const storeData = await Store.findOne({
                storeId: req.body.storeId
            }, {})
            const mainData = {
                idCart: data.id,
                storeId: storeData.storeId,
                name: storeData.name,
                totalQuantity: data_arr.length,
                totalAmount: parseFloat(totalAmount).toFixed(2),
                list: data_arr
            }
            await createLog('200', req.method, req.originalUrl, res.body, 'getCartToShow successfully')
            res.status(200).json(mainData)
        } else {
            // console.log('พบ')
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            res.status(200).json({
                status: 204,
                message: 'No Data'
            })
        }
    } catch (error) {
        console.log(error)
        await createLog('500', res.method, req.originalUrl, res.e, error.stack)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

getCart.post('/getPreOrder', async (req, res) => {
    try {
        const data = await Cart.findOne({ area: req.body.area, storeId: req.body.storeId }, {
            'list._id': 0,
            __v: 0,
            _id: 0
        });
        const dataPromotion = await axios.post(process.env.API_URL_IN_USE + '/cms/saleProduct/summaryCompare', {
            area: req.body.area,
            storeId: req.body.storeId
        });
        const responseData = dataPromotion.data;

        if (data) {
            const dataUser = await User.findOne({ saleCode: req.body.saleCode })
            const dataStore = await Store.findOne({ storeId: req.body.storeId })
            const mainList = [];

            for (const listdata of data.list) {
                const unitData = await Unit.findOne({ idUnit: listdata.unitId })
                const discountInfo = responseData.listDiscount.find(discount => discount.productId.includes(listdata.id))
                const dataList = {
                    id: listdata.id,
                    name: listdata.name,
                    nameDetail: slicePackSize(listdata.name),
                    qty: listdata.qty,
                    type: "buy",
                    unitQty: unitData ? unitData.idUnit : '',
                    nameQty: unitData ? unitData.nameThai : '',
                    qtyText: listdata.qty + ' ' + (unitData ? unitData.nameThai : ''),
                    pricePerQty: parseFloat(parseFloat(listdata.pricePerUnitSale).toFixed(2)),
                    discount: parseFloat(parseFloat(discountInfo ? discountInfo.discount : 0).toFixed(2)),
                    totalDiscount: parseFloat(parseFloat(discountInfo ? discountInfo.totalDiscount : 0).toFixed(2)),
                    amount: parseFloat(parseFloat(listdata.qty * listdata.pricePerUnitSale).toFixed(2)),
                    totalAmount: parseFloat(parseFloat(listdata.qty * listdata.pricePerUnitSale - (discountInfo ? discountInfo.totalDiscount : 0)).toFixed(2))
                };

                mainList.push(dataList)
            }

            let listFree_Arr = [];
            for (const listFreePro of responseData.listFree) {
                for (const listFreeItem of listFreePro.listProduct) {
                    const unitData = await Unit.findOne({ idUnit: listFreeItem.unitQty })
                    const dataListFree = {
                        id: listFreeItem.productId,
                        name: slicePackSize(listFreeItem.productName),
                        nameDetail: listFreeItem.productName,
                        qty: listFreeItem.qty,
                        type: "free",
                        proCode: listFreePro.proCode,
                        unitQty: unitData ? unitData.idUnit : '',
                        nameQty: unitData ? unitData.nameThai : '',
                        qtyText: listFreeItem.qty + ' ' + (unitData ? unitData.nameThai : ''),
                        pricePerQty: '0.00',
                        discount: 0,
                        totalDiscount: 0,
                        amount: 0,
                        totalAmount: '0.00'
                    };
                    listFree_Arr.push(dataListFree)
                }
            }

            const totalAmountSum = mainList.reduce((sum, item) => sum + item.totalAmount, 0)
            const totalDiscountSum = mainList.reduce((sum, item) => sum + item.totalDiscount, 0)

            const mainData = {
                saleMan: dataUser.firstName + ' ' + dataUser.surName,
                storeId: data.storeId,
                storeName: dataStore.name,
                address: dataStore.address + ' ' + dataStore.district + ' ' + dataStore.subDistrict + ' ' + dataStore.province,
                taxID: dataStore.taxId,
                tel: dataStore.tel,
                totalAmount: parseFloat(totalAmountSum.toFixed(2)),
                discount: totalDiscountSum,
                totalAmountNoVat: parseFloat((totalAmountSum / 1.07).toFixed(2)),
                vat: parseFloat((totalAmountSum - (totalAmountSum / 1.07)).toFixed(2)),
                summaryAmount: parseFloat(totalAmountSum.toFixed(2)),
                list: mainList,
                listFree: listFree_Arr,
                shippingAddress: data.shipping.address,
                shippingDate: data.shipping.dateShip
            };

            await createLog('200', req.method, req.originalUrl, res.body, 'getPreOrder successfully')
            res.status(200).json(mainData)
        } else {
            await createLog('200', req.method, req.originalUrl, res.body, 'No Data')
            res.status(200).json({
                status: 200,
                message: 'No Data'
            });
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

// getCart.post('/getSummaryCart', async (req, res) => {
//     try {
//         const data = await Cart.findOne({ area: req.body.area, storeId: req.body.storeId }, {
//             'list._id': 0,
//             __v: 0,
//             _id: 0
//         });
//         const dataStore = await Store.findOne({ area: req.body.area, storeId: req.body.storeId }, { __v: 0, _id: 0 });
//         const listProduct = [];
//         const listProductGroup = {};
//         let totalAmount = 0;

//         for (const list of data.list) {
//             const dataProduct = await Product.findOne({ id: list.id });
//             const factoryCal = await Product.findOne({
//                 id: list.id,
//                 convertFact: { $elemMatch: { unitId: list.unitId } }
//             }, { 'convertFact.$': 1 });

//             const unitDetail = await Unit.findOne({ idUnit: list.unitId });

//             const amount = list.qty * list.pricePerUnitSale;
//             totalAmount += amount;

//             // Calculate converted quantities for all units
//             const convertedUnits = dataProduct.convertFact.map(convFact => ({
//                 name: convFact.unitName,
//                 qty: parseInt((list.qty * factoryCal.convertFact[0].factor) / convFact.factor),
//                 unitId: convFact.unitId
//             }));

//             listProduct.push({
//                 id: list.id,
//                 brand: dataProduct.brand,
//                 qtyPurc: list.qty,
//                 qtyUnitId: list.unitId,
//                 qtyUnitName: unitDetail.nameEng,
//                 qtyconvert: factoryCal.convertFact[0].factor * list.qty,
//                 amount: amount,
//                 converterUnit: convertedUnits,
//                 flavour: dataProduct.flavour // เพิ่มข้อมูลรสชาติ
//             });

//             const groupKey = `${dataProduct.group}_${dataProduct.brand}_${dataProduct.size}_${dataProduct.flavour}`;
//             if (!listProductGroup[groupKey]) {
//                 listProductGroup[groupKey] = {
//                     group: dataProduct.group,
//                     brand: dataProduct.brand,
//                     size: dataProduct.size,
//                     flavour: dataProduct.flavour,
//                     typeUnit: unitDetail.nameThai === 'แผง' ? 'แผง' : 'ไม่แผง',
//                     qty: 0,
//                     amount: 0,
//                     converterUnit: convertedUnits,
//                     listProduct: [] // เพิ่ม listProduct
//                 };
//             }
//             listProductGroup[groupKey].qty += factoryCal.convertFact[0].factor * list.qty;
//             listProductGroup[groupKey].amount += amount;
//             listProductGroup[groupKey].converterUnit = convertedUnits;

//             listProductGroup[groupKey].listProduct.push({
//                 id: dataProduct.id,
//                 name: dataProduct.name,
//                 group: dataProduct.group,
//                 brand: dataProduct.brand,
//                 size: dataProduct.size,
//                 flavour: dataProduct.flavour
//             });
//         }

//         const listProductGroupArray = Object.values(listProductGroup);

//         const summaryMainData = {
//             listProduct: listProduct,
//             listProductGroup: listProductGroupArray,
//             totalAmount: totalAmount
//         };

//         await createLog('200', req.method, req.originalUrl, res.body, 'getSummary successfully');
//         res.status(200).json({ typeStore: dataStore.type, list: summaryMainData });
//     } catch (error) {
//         console.log(error);
//         await createLog('500', req.method, req.originalUrl, res.body, error.message);
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// });

// getCart.post('/getSummaryCart', async (req, res) => {
//     try {
//         const data = await Cart.findOne({ area: req.body.area, storeId: req.body.storeId }, {
//             'list._id': 0,
//             __v: 0,
//             _id: 0
//         });
//         const dataStore = await Store.findOne({ area: req.body.area, storeId: req.body.storeId }, { __v: 0, _id: 0 });
//         const listProduct = [];
//         const listProductGroup = {};
//         let totalAmount = 0;

//         for (const list of data.list) {
//             const dataProduct = await Product.findOne({ id: list.id });
//             const factoryCal = await Product.findOne({
//                 id: list.id,
//                 convertFact: { $elemMatch: { unitId: list.unitId } }
//             }, { 'convertFact.$': 1 });

//             const unitDetail = await Unit.findOne({ idUnit: list.unitId });

//             const amount = list.qty * list.pricePerUnitSale;
//             totalAmount += amount;

//             // Calculate converted quantities for all units
//             const convertedUnits = dataProduct.convertFact.map(convFact => ({
//                 name: convFact.unitName,
//                 qty: parseInt((list.qty * factoryCal.convertFact[0].factor) / convFact.factor),
//                 unitId: convFact.unitId
//             }));

//             listProduct.push({
//                 id: list.id,
//                 qty: factoryCal.convertFact[0].factor * list.qty,
//                 amount: amount,
//                 converterUnit: convertedUnits
//             });

//             // Group products by group, brand, size
//             const groupKey = `${dataProduct.group}_${dataProduct.brand}_${dataProduct.size}__${list.unitId}`;
//             if (!listProductGroup[groupKey]) {
//                 listProductGroup[groupKey] = {
//                     group: dataProduct.group,
//                     brand: dataProduct.brand,
//                     size: dataProduct.size,
//                     typeUnit: unitDetail.nameThai === 'แผง' ? 'แผง' : 'ไม่แผง',
//                     totalQty: 0,
//                     totalAmount: 0,
//                     converterUnit: [],
//                     listProduct: []
//                 };
//             }

//             listProductGroup[groupKey].totalQty += factoryCal.convertFact[0].factor * list.qty;
//             listProductGroup[groupKey].totalAmount += amount;
//             listProductGroup[groupKey].listProduct.push({
//                 id: dataProduct.id,
//                 name: dataProduct.name,
//                 flavour: dataProduct.flavour,
//                 qtyPerFlavour: factoryCal.convertFact[0].factor * list.qty,
//                 amountPerFlavour: amount
//             });
//         }

//         // Calculate converterUnit for each product group
//         for (const groupKey in listProductGroup) {
//             const groupData = listProductGroup[groupKey];
//             const productSample = await Product.findOne({ group: groupData.group, brand: groupData.brand, size: groupData.size });

//             if (productSample) {
//                 groupData.converterUnit = productSample.convertFact.map(convFact => ({
//                     name: convFact.unitName,
//                     qty: parseInt(groupData.totalQty / convFact.factor),
//                     unitId: convFact.unitId
//                 }));
//             }
//         }

//         const listProductGroupArray = Object.values(listProductGroup);

//         const summaryMainData = {
//             listProduct: listProduct,
//             listProductGroup: listProductGroupArray,
//             totalAmount: totalAmount
//         };

//         await createLog('200', req.method, req.originalUrl, res.body, 'getSummary successfully');
//         res.status(200).json({ typeStore: dataStore.type, list: summaryMainData });
//     } catch (error) {
//         console.log(error);
//         await createLog('500', req.method, req.originalUrl, res.body, error.message);
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// });

getCart.post('/getSummaryCart', async (req, res) => {
    try {
        const data = await Cart.findOne({ area: req.body.area, storeId: req.body.storeId }, {
            'list._id': 0,
            __v: 0,
            _id: 0
        });
        const dataStore = await Store.findOne({ area: req.body.area, storeId: req.body.storeId }, { __v: 0, _id: 0 });
        const listProduct = [];
        const listProductGroup = {};
        let totalAmount = 0;

        for (const list of data.list) {
            const dataProduct = await Product.findOne({ id: list.id });
            const factoryCal = await Product.findOne({
                id: list.id,
                convertFact: { $elemMatch: { unitId: list.unitId } }
            }, { 'convertFact.$': 1 });

            const unitDetail = await Unit.findOne({ idUnit: list.unitId });

            const amount = list.qty * list.pricePerUnitSale;
            totalAmount += amount;

            const convertedUnits = dataProduct.convertFact.map(convFact => ({
                name: convFact.unitName,
                qty: parseInt((list.qty * factoryCal.convertFact[0].factor) / convFact.factor),
                unitId: convFact.unitId
            }));

            listProduct.push({
                id: list.id,
                qty: factoryCal.convertFact[0].factor * list.qty,
                amount: amount,
                converterUnit: convertedUnits
            });

            const groupKey = `${dataProduct.group}_${dataProduct.brand}_${dataProduct.size}__${list.unitId}`;
            if (!listProductGroup[groupKey]) {
                listProductGroup[groupKey] = {
                    group: dataProduct.group,
                    brand: dataProduct.brand,
                    size: dataProduct.size,
                    typeUnit: unitDetail.nameThai === 'แผง' ? 'แผง' : 'ไม่แผง',
                    totalQty: 0,
                    totalAmount: 0,
                    converterUnit: [...convertedUnits], 
                    listProduct: []
                };
            } else {
                listProductGroup[groupKey].converterUnit.forEach(unit => {
                    const correspondingUnit = convertedUnits.find(u => u.unitId === unit.unitId);
                    if (correspondingUnit) {
                        unit.qty += correspondingUnit.qty;
                    }
                });
            }

            listProductGroup[groupKey].totalQty += factoryCal.convertFact[0].factor * list.qty;
            listProductGroup[groupKey].totalAmount += amount;
            listProductGroup[groupKey].listProduct.push({
                id: dataProduct.id,
                name: dataProduct.name,
                flavour: dataProduct.flavour,
                qtyPerFlavour: factoryCal.convertFact[0].factor * list.qty,
                amountPerFlavour: amount
            });
        }

        const listProductGroupArray = Object.values(listProductGroup);

        const summaryMainData = {
            listProduct: listProduct,
            listProductGroup: listProductGroupArray,
            totalAmount: totalAmount
        };

        await createLog('200', req.method, req.originalUrl, res.body, 'getSummary successfully');
        res.status(200).json({ typeStore: dataStore.type, list: summaryMainData });
    } catch (error) {
        console.log(error);
        await createLog('500', req.method, req.originalUrl, res.body, error.message);
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = getCart