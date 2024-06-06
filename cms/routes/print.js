const express = require('express')
const print = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()

print.use(express.json())
print.use(cors())

const printOrder = require('../controller/print/printOrder')

print.use('/',printOrder)

module.exports = print