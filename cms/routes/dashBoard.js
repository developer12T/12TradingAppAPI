const express = require('express')
const dashboard = express()
const cors = require('cors')

require('dotenv').config()

dashboard.use(express.json())
dashboard.use(cors())


const getDashboard = require('../controller/dashboard/getDashboard')
const getReport = require('../controller/dashboard/getReport')
const getReportDetail = require('../controller/dashboard/getReportDetail')

dashboard.use('/',getDashboard)
dashboard.use('/report',getReport)
dashboard.use('/reportDetail',getReportDetail)

module.exports = dashboard