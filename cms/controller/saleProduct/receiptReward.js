const express = require('express')
require('../../configs/connect')
const {currentdateDash} = require("../../utils/utility");

const receiptReward = express.Router()

receiptReward.post('/receiptReward', async (req, res) => {
    try {
        const listProduct = req.body.ListProduct
        const listGroup = req.body.ProductGroup
        // console.log(listProduct)
        // console.log('*--------------------------------------------------------------------*')
        // console.log(listGroup)

        for(const list of listProduct){
            console.log(list)
        }

        const saveData = {
            area: req.body.area,
            storeId:req.body.storeId,
            proId: 'pro03',
            listFreeItem:[],
            listFreeGroup:[],
            createDate:currentdateDash(),
            updateDate:null
        }


        res.status(200).json(req.body)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = receiptReward