const express = require('express')
const monitorLog = express()
const cors = require('cors')

require('dotenv').config()

monitorLog.use(express.json())
monitorLog.use(cors())


const reportLog = require('../controller/reportLogApi/getMain')

monitorLog.use('/',reportLog)

module.exports = monitorLog