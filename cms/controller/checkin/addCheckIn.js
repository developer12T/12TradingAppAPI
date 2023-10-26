const express = require('express')
require('../../configs/connect')
const {Checkin} = require("../../models/route")
const addCheckIn = express.Router()
const _ = require('lodash')
addCheckIn.post('/newCheckIn', async (req, res) => {
    try {
        const idDb = await Checkin.find({id: req.body.id}).exec()
        if (idDb.length !== 0) {
            const list = []
            for (const data of req.body.storeId) {
                const listDetail = {
                    storeId: data,
                    status: 'ยังไม่เช็คอิน',
                    lat: '',
                    long: '',
                    note: ''
                }
                await Checkin.updateOne({id: req.body.id}, {$push: {detail: listDetail}})
            }
            res.status(200).json('add CheckIn')
        } else {
            const list = []
            const mainData = []
            for (const data of req.body.storeId) {
                // console.log(data)
                const listDetail = {
                    storeId: data,
                    status: 'ยังไม่เช็คอิน',
                    lat: '',
                    long: '',
                    note: ''
                }
                list.push(listDetail)
            }
            mainData.id = req.body.id
            mainData.detail = list
            // console.log(mainData)
            const newRoute = new Checkin(mainData)
            await newRoute.save()
            res.status(200).json('add CheckIn')
        }
    } catch (e) {
        res.status(500).json(e)
    }
})

addCheckIn.post('/visit', async (req, res) => {
    // Create a new "lat" field if it doesn't exist in the "detail" array
    await Checkin.updateOne(
        { id: req.body.id, 'detail.storeId': req.body.storeId },
        {
            $set: {
                'detail.lat': req.body.latt, // This will create the "lat" field if it doesn't exist
                'detail.long': req.body.longt,
                'detail.note': req.body.note,
                'detail.status': req.body.status
            }
        }
    );
    res.status(200).json('test visit');
})

module.exports = addCheckIn