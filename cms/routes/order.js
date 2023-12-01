const express = require('express')
const order = express()
const cors = require('cors')

require('dotenv').config()

order.use(express.json())
order.use(cors())


const getOrder = require('../controller/order/getOrder')
const addOrder = require('../controller/order/addOrder')
const updateOrder = require('../controller/order/updateOrder')

order.use('/',getOrder)
order.use('/',addOrder)
order.use('/',updateOrder)

module.exports = order