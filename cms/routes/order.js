const express = require('express')
const order = express()
const cors = require('cors')

require('dotenv').config()

order.use(express.json())
order.use(cors())


const getOrder = require('../controller/order/getOrder')
const addOrder = require('../controller/order/addOrder')

order.use('/getOrder',getOrder)
order.use('/addOrder',addOrder)

module.exports = order