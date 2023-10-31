const express = require('express')
const saleProduct = express()
const cors = require('cors')
require('dotenv').config()

saleProduct.use(express.json())
saleProduct.use(cors())

const addCart = require('../controller/saleProduct/addCart')
const getProduct = require('../controller/saleProduct/getProduct')

saleProduct.use('/Cart',addCart)
saleProduct.use('/Product',getProduct)


module.exports = saleProduct