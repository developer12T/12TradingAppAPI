const express = require('express')
require('../../../configs/connect')
const newGiveProduct = express.Router()

const {GiveProduct} = require("../../../models/giveProduct")
const {createLog} = require("../../../services/errorLog");

newGiveProduct.put('/newGiveProduct', async (req, res) => {
    const { currentdateDash } = require('../../../utils/utility.js')
    try {
        if (req.body.id !== undefined && req.body.id !== '') {
            if (req.body.appPerson !== undefined && req.body.appPerson !== '') {
                if (req.body.status !== undefined && req.body.status !== '') {
                    await GiveProduct.updateOne({id: req.body.id}, {
                        $set: {
                            status: req.body.status,
                            'approve.dateAction': currentdateDash(),
                            'approve.appPerson': req.body.appPerson,
                        }
                    })
                    await createLog('200',req.method,req.originalUrl,res.body,'GiveProduct approve complete!')
                    res.status(200).json({status: 200, message: 'GiveProduct approve complete!'})
                } else {
                    await createLog('501',req.method,req.originalUrl,res.body,'require data!')
                    res.status(501).json({status: 501, message: 'require data!'})
                }
            } else {
                await createLog('501',req.method,req.originalUrl,res.body,'require data!')
                res.status(501).json({status: 501, message: 'require data!'})
            }
        } else {
            await createLog('501',req.method,req.originalUrl,res.body,'require data!')
            res.status(501).json({status: 501, message: 'require data!'})
        }
    } catch (error) {
        await createLog('500',req.method,req.originalUrl,res.body,error.message)
        res.status(500).json({status: 500, message: error.message})
    }
})

module.exports = newGiveProduct
