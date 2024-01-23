const express = require('express')
require('../../../configs/connect')
const newGiveProduct = express.Router()

const {GiveProduct} = require("../../../models/giveProduct")

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
                    res.status(200).json({status: 200, message: 'GiveProduct approve complete!'})
                } else {
                    res.status(501).json({status: 501, message: 'require data!'})
                }
            } else {
                res.status(501).json({status: 501, message: 'require data!'})
            }
        } else {
            res.status(501).json({status: 501, message: 'require data!'})
        }
    } catch (error) {
        res.status(500).json({status: 500, message: error.message})
    }
})

module.exports = newGiveProduct
