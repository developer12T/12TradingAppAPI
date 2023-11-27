const express = require('express')
const refund = express()
const cors = require('cors')

require('dotenv').config()

refund.use(express.json())
refund.use(cors())


const refundProduct = require('../controller/refund/openRefund')
const getProduct = require('../controller/refund/getProduct')

refund.use('/openRefund',refundProduct)
refund.use('/openRefund',getProduct)

module.exports = refund