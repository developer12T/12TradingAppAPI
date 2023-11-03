const express = require('express')
const order = express()
const cors = require('cors')

require('dotenv').config()

order.use(express.json())
order.use(cors())


const getOrder = require('../controller/order/getOrder')

order.use('/getOrder',getOrder)

module.exports = order