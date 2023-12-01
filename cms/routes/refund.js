const express = require('express')
const refund = express()
const cors = require('cors')

require('dotenv').config()

refund.use(express.json())
refund.use(cors())


const refundProduct = require('../controller/refund/openRefund')
const getProduct = require('../controller/refund/getProduct')
const getRefundProduct = require('../controller/refund/getRefund')

refund.use('/',refundProduct)
refund.use('/',getProduct)
refund.use('/',getRefundProduct)

module.exports = refund