const express = require('express')
const dashBoard = express()
const cors = require('cors')

require('dotenv').config()

dashBoard.use(express.json())
dashBoard.use(cors())


const getDashBoard = require('../controller/dashBoard/getDashBoard')
const getReport = require('../controller/dashBoard/getReport')
const getReportDetail = require('../controller/dashBoard/getReportDetail')

dashBoard.use('/',getDashBoard)
dashBoard.use('/report',getReport)
dashBoard.use('/reportDetail',getReportDetail)

module.exports = dashBoard