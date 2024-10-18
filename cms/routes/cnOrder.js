const express = require('express')
const cnOrder = express()
const cors = require('cors')

require('dotenv').config()

cnOrder.use(express.json())
cnOrder.use(cors())


const getCnOrder = require('../controller/cnOrder/getCnOrder')
const addCnOrder = require('../controller/cnOrder/addCnOrder')
const updateOrder = require('../controller/cnOrder/updateCnOrder')

const getProductCn = require('../controller/cnOrder/cartCn/getProduct')
const addProductToCnCart = require('../controller/cnOrder/cartCn/addProduct')
const getCartCn = require('../controller/cnOrder/cartCn/getCartCn')

cnOrder.use('/',getCnOrder)
cnOrder.use('/',addCnOrder)
cnOrder.use('/',getProductCn)
cnOrder.use('/',addProductToCnCart)
cnOrder.use('/',getCartCn)
cnOrder.use('/',updateOrder)

module.exports = cnOrder