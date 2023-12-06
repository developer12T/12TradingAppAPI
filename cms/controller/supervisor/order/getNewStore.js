const express = require('express')
require('../../../configs/connect')
const getNewStore = express.Router()
const {Store} = require('../../../models/store')

getNewStore.post('/getNew', async (req, res) => {
    const {currentdateDash} = require('../../../utils/utility.js')
    try {
        const data = await Store.find({'approve.status':'1'})
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({status: 500, message: error.message})
    }
})

module.exports = getNewStore
