const express = require('express')

require('../../configs/connect')
const getProduct = express.Router()

getProduct.post('/getAll', async (req, res) => {
    try {

        res.status(200).json('get all --')

    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = getProduct