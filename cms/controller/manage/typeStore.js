const express = require('express')
require('../../configs/connect')
const typeStore = express.Router()
const { TypeStore } = require('../../models/store')
const {currentdateDash} = require("../../utils/utility");
const axios = require("axios");

typeStore.post('/getAll', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        const data = await TypeStore.find().exec();
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})

typeStore.post('/addTypeStore', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        req.body.createDate = currentdateDash()
        req.body.modifyDate = currentdateDash()
        req.body.status = '1'
         const newStore = new TypeStore(req.body)
         await newStore.save()
        res.status(200).json(req.body)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

typeStore.post('/addTypeStoreFromM3', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        const response = await axios.post('http://58.181.206.159:9814/cms_api/cms_shoptype.php')
        for(const list of response.data){
            list.createDate = currentdateDash()
            list.modifyDate = currentdateDash()
            list.status = '1'
            await TypeStore.create(list)
        }
        res.status(200).json({status:201,message:'Added Type Store Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
})

typeStore.put('/editTypeStore', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        if(!req.body.id){
            res.status(501).json({message:'require body'})
        }else{
            if(req.body.name !== ''){
                if(req.body.descript !== ''){
                    await TypeStore.updateOne({id:req.body.id}, { $set: { name: req.body.name,modifyDate:currentdateDash(),descript:req.body.descript } })
                }else{
                    await TypeStore.updateOne({id:req.body.id}, { $set: { name: req.body.name,modifyDate:currentdateDash() } })
                }
                
            res.status(200).json({message:`update Success id: ${req.body.id} `})
            }else{
                res.status(501).json({message:'empty body require!'})
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})

typeStore.put('/updateTypeStore', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        if(!req.body.id){
            res.status(501).json({status:501,message:'require body'})
        }else{
            if(req.body.id !== ''){
                const data = await TypeStore.findOne({id:req.body.id}).exec();
                if(data.status === '1'){
                    var st = '0'
                }else{
                    var st = '1'
                }
                 await TypeStore.updateOne({id:req.body.id}, { $set: { status: st} })
                res.status(200).json({status:200,message:'Update Status Successfully'})
            }else{
                res.status(501).json({status:501,message:'empty body require!'})
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})
 
module.exports = typeStore

