const express = require('express')

require('../../configs/connect')
const addCart = express.Router()

addCart.post('/addCart', async (req, res) => {
    try {

        res.status(200).json('add cart --')

    } catch (e) {
        res.status(500).json(e)
    }
})

module.exports = addCart