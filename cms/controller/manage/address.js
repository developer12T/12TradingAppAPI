const express = require('express')
require('../../configs/connect')
const address = express.Router()
const { Address  } = require('../../models/addressData')

address.post('/getAll', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        const data = await Address.find().exec()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})

address.post('/getProvince', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
    //    const data = await Address.find().exec()

        // const data = await Address.distinct('province').exec()

        const data = await Address.aggregate([
            { $group: { _id: '$province' } },
            { $project: { _id: 0, province: '$_id' } }
        ]).exec();

        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})

address.post('/getAmphoe', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
    //    const data = await Address.find().exec()

    // const data = await Address.find({province:req.body.province}).exec()
    const data = await Address.aggregate([
        { $match: { province: req.body.province } },
        { $group: { _id: '$amphoe' } },
        { $project: { _id: 0, amphoe: '$_id' } }
    ]).exec()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})

address.post('/getDistrict', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {

    // const data = await Address.find({province:req.body.province}).exec()
    const data = await Address.aggregate([
        { $match: { amphoe: req.body.amphoe } },
        { $group: { _id: '$district' } },
        { $project: { _id: 0, district: '$_id' } }
    ]).exec()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})

address.post('/getZipcode', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {

    // const data = await Address.find({province:req.body.province}).exec()
    const data = await Address.aggregate([
        { $match: { 
            amphoe: req.body.amphoe,
            district: req.body.district,
            province: req.body.province,
        } },
        { $group: { _id: '$zipcode',provincecode: { $first: '$province_code' } } },
        { $project: { _id: 0, zipcode: '$_id',provincecode: 1 } }
    ]).exec()
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status:500,
            message:error.message
        })
    } 
})



module.exports = address
