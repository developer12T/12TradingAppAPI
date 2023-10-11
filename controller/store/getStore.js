const express = require('express')
require('../../configs/connect')
const getStore = express.Router()
const { Store } = require('../../models/store')

getStore.post('/getAll', async(req, res) => {
    try {
        const data = await Store.find().sort({ idNumber: 1 }).exec()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 
})

getStore.post('/getWithCondition', async(req, res) => {
    try {
        if(req.body.tab === 'new'){
            // const data = await Store.find({status:'0','approve.status':'1'}).sort({ idNumber: 1 }).exec()
            // const data = await Store.find({ status: '0', 'approve.status': { $ne: '2' } }).sort({ idNumber: 1 }).exec()
            const data = await Store.find().sort({ idNumber: -1 }).exec()

            res.status(200).json(data)
        }else if(req.body.tab === 'all'){
            const data = await Store.find({status:'1','approve.status':'2'}).sort({ idNumber: 1 }).exec()
            res.status(200).json(data)
        }else{
            res.status(501).json({message:'empty tab!'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 
})

getStore.post('/getDetail', async(req, res) => {
    try {
        if(req.body.id !== '' && req.body.id !== undefined){
            const data = await Store.find({idNumber:req.body.id},
                { _id:0,'approve._id':0,policyConsent:0,imageList:0,createdAt:0,updatedAt:0,__v:0 }).sort({ idNumber: -1 }).exec()
            res.status(200).json(data)
        }else{
            res.status(501).json({message:'require body!'})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 
})

module.exports = getStore

