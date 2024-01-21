
const express = require('express')
const giveProduct = express()
const cors = require('cors')

require('dotenv').config()

giveProduct.use(express.json())
giveProduct.use(cors())

const getGiveProduct = require('../controller/giveProduct/getGiveProduct')
const addGiveProduct = require('../controller/giveProduct/addGiveProduct')

giveProduct.use('/',getGiveProduct)
giveProduct.use('/',addGiveProduct)

module.exports = giveProduct