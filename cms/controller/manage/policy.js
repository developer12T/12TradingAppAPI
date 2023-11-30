const express = require('express')
require('../../configs/connect')
const {Policy} = require("../../models/policy")
const policyManage = express.Router()

policyManage.post('/addPolicy', async (req, res) => {
    try {
        await Policy.create(req.body)
        res.json({
            status: 200,
            message: 'Policy added successfully'
        });
    } catch (error) {
        console.error(error)

        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

policyManage.post('/getPolicy', async (req, res) => {
    try {
        res.json( await Policy.find())
    } catch (error) {
        console.error(error)

        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});


module.exports = policyManage;
