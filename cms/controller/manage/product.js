const express = require('express')
require('../../configs/connect')
const ProductManage = express.Router()
const {Product, Unit} = require('../../models/product')
const {statusDes} = require("../../models/statusDes");
const {log} = require("winston");
const _ = require('lodash')
const axios = require("axios");
const {Store} = require("../../models/store");
const {createLog} = require("../../services/errorLog");
ProductManage.post('/getAll', async (req, res) => {
    try {
        const data = await Product.find({}, {_id: 0, __v: 0})
        await createLog('200',req.method,req.originalUrl,res.body,'getAll Product Successfully!')
        res.status(200).json(data)
    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

ProductManage.post('/addProduct', async (req, res) => {
    try {
        const idInsert = await Product.findOne({}, {_id: 0, idIndex: 1}).sort({idIndex: -1})
        if (idInsert === null) {
            var idIndex = 1
        } else {
            var idIndex = idInsert.idIndex + 1
        }
        req.body.idIndex = idIndex
        req.body.status = 1

        const sortedUnitList = _.orderBy(req.body.unitList, ['pricePerUnitSale'], ['desc'])
        // console.log(sortedUnitList)
        const newProduct = new Product(req.body)
        await newProduct.save()
        await createLog('200',req.method,req.originalUrl,res.body,'addProduct Successfully!')
        res.status(200).json({status: 201, message: 'Product Added Successfully'})
    } catch (e) {
        console.log(e)
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

ProductManage.post('/addProductFromM3', async (req, res) => {
    try {
        const dataArray = []
        const listTypeUnitConvert = []
        const response = await axios.post('http://58.181.206.159:9814/cms_api/cms_product.php')
        for (let i = 0; i < response.data.length; i++) {
            const idInsert = await Product.findOne({}, {_id: 0, idIndex: 1}).sort({idIndex: -1})
            if (idInsert === null) {
                var idIndex = 1
            } else {
                var idIndex = idInsert.idIndex + 1
            }
            response.data[i].idIndex = idIndex
            response.data[i].status = 1

            const StoreIf = await Product.findOne({id: response.data[i].id})
            if (!StoreIf) {
                if (response.data[i].type === 'พรีเมียม') {
                    for(const listUnit of response.data[i].unitList){
                        const dataUnitList = await Unit.findOne({idUnit:listUnit.id})
                        const convertFact_obj = {
                            unitId: listUnit.id,
                            unitName: dataUnitList.nameEng,
                            factor: 1,
                            description:` 1 ${dataUnitList.nameEng} = 1 `
                        }
                        listTypeUnitConvert.push(convertFact_obj)
                    }
                    response.data[i].convertFact = listTypeUnitConvert
                } else {
                    const responseData = await axios.post('http://192.168.2.97:8383/M3API/ItemManage/Item/getItemConvertItemcode', {
                        itcode : response.data[i].id
                    })
                    for (const listResUnit of responseData.data[0].type) {

                        if(response.data[i].name.includes('ชนิดแผง')){
                            // console.log(response.data[i].name)
                            if(listResUnit.unit === 'BAG'){
                                var getUnitId = await Unit.findOne({nameEng: listResUnit.unit,nameThai:'แผง'})
                            }else{
                                var getUnitId = await Unit.findOne({nameEng: listResUnit.unit})
                            }
                        }else{
                            var getUnitId = await Unit.findOne({nameEng: listResUnit.unit})
                        }

                        const convertFact_obj = {
                            unitId: getUnitId.idUnit,
                            unitName: getUnitId.nameEng,
                            factor: listResUnit.factor,
                            description:` 1 ${getUnitId.nameEng} = ${listResUnit.factor}`
                        }
                        listTypeUnitConvert.push(convertFact_obj)
                    }
                    response.data[i].convertFact = listTypeUnitConvert
                }
                // console.log(listTypeUnitConvert)
                // console.log(response.data[i].unitList)
                await Product.create(response.data[i])
                listTypeUnitConvert.length = 0
            } else {
                const idProductReplace = {
                    idStore: response.data[i].storeId,
                    name: response.data[i].name
                }
                dataArray.push(idProductReplace)
            }
        }

        var idUnitList = []
        var idConvList = []
        const UnitComConv = await Product.find()
        for(const ListUnitComConv of UnitComConv ){
            for(const unitList of ListUnitComConv.unitList){
                idUnitList.push(unitList.id)
            }
            for(const convList of ListUnitComConv.convertFact){
                idConvList.push(convList.unitId)
            }
             const dataToPushConv = _.difference(idUnitList,idConvList)
             console.log(dataToPushConv[0])
            if(dataToPushConv.length !== 0){
                const dataUnitConv = await Unit.findOne({idUnit:dataToPushConv[0]})
                const dataPush = {
                    unitId:dataToPushConv[0],
                    unitName:dataUnitConv.nameEng,
                    factor:1,
                    description:`1 ${dataUnitConv.nameEng} = 1`
                }
                await Product.updateOne({id:ListUnitComConv.id},{$push:{convertFact:dataPush}})
            }else{

            }
            idUnitList = []
            idConvList = []
        }
        await createLog('200',req.method,req.originalUrl,res.body,'addProductFromM3 Successfully!')
        res.status(200).json({status: 201, message: 'Product Added Succesfully', additionalData: dataArray})

    } catch (e) {
        console.log(e)
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

ProductManage.put('/updateProduct', async (req, res) => {
    try {
        const data = await Product.updateOne({id: req.body.id}, {$set: req.body})
        await createLog('200',req.method,req.originalUrl,res.body,'updateProduct Successfully!')
        res.status(200).json({status: 201, message: 'update ' + data.modifiedCount + ' row complete'})
    } catch (error) {
        console.log(error)
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = ProductManage