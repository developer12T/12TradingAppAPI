const express = require('express')
const saleProduct = express()
const cors = require('cors')
require('dotenv').config()

saleProduct.use(express.json())
saleProduct.use(cors())

const addCart = require('../controller/saleProduct/addCart')

saleProduct.use('/addCart',addCart)


module.exports = saleProduct