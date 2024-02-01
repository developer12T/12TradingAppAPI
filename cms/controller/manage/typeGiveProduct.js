const express = require('express')
const {createLog} = require("../../services/errorLog");
const {typeGive} = require("../../models/giveProduct");
const typeGiveProduct = express.Router()

typeGiveProduct.get('/getAll', async (req, res) => {
    try {
        const data = await typeGive.find({}, {_id: 0, __v: 0})
        await createLog('200',req.method,req.originalUrl,res.body,'getAll typeGive Successfully!')
        res.status(200).json(data)
    } catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

typeGiveProduct.post('/addTypeGiveProduct', async (req, res) => {
    try {
        const idType = await typeGive.find({},{id:1}).sort({id:-1})
        // console.log(idType)
        if(idType.length > 0){
            req.body.id = idType[0].id + 1
        }else{
            req.body.id = 1
        }
        await typeGive.create(req.body)
        await createLog('200',req.method,req.originalUrl,res.body,'addTypeGiveProduct Successfully!')
        res.status(201).json({status: 201, message: 'Added TypeGiveProduct Successfully'})
    } catch (e) {
        console.log(e)
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = typeGiveProduct