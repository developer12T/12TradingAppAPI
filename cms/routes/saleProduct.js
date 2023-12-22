const express = require('express')
const saleProduct = express()
const cors = require('cors')
require('dotenv').config()

saleProduct.use(express.json())
saleProduct.use(cors())

const addCart = require('../controller/saleProduct/addCart')
const getCart = require('../controller/saleProduct/getCart')
const getProduct = require('../controller/saleProduct/getProduct')
const comparePromotion = require('../controller/saleProduct/comparePromotion')

saleProduct.use('/',addCart)
saleProduct.use('/',getCart)
saleProduct.use('/',getProduct)
saleProduct.use('/',comparePromotion)

module.exports = saleProduct