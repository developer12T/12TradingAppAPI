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
                    latitude: '',
                    longtitude: '',
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
                    latitude: '',
                    longtitude: '',
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
    await Checkin.updateOne(
        {
            $and: [
                {id: req.body.id},
                {'detail.storeId': req.body.storeId}
            ]
        },
        {
            $set: {
                'detail.$.latitude': req.body.latitude,
                'detail.$.longtitude': req.body.longtitude,
                'detail.$.note': req.body.note,
                'detail.$.status': req.body.status
            }
        }
    )
    const data = await Checkin.find({}, {'_id': 0, 'detail': {$elemMatch: {'storeId': req.body.storeId}}}).exec()
    res.status(200).json(data)
})

module.exports = addCheckIn