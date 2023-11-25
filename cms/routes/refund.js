const express = require('express')
const refund = express()
const cors = require('cors')

require('dotenv').config()

refund.use(express.json())
refund.use(cors())


const refundProduct = require('../controller/refund/openRefund')

refund.use('/openRefund',refundProduct)

module.exports = refund