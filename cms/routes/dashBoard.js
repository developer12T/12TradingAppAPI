const express = require('express')
const dashBoard = express()
const cors = require('cors')

require('dotenv').config()

dashBoard.use(express.json())
dashBoard.use(cors())


const getDashBoard = require('../controller/dashBoard/getDashBoard')

dashBoard.use('/',getDashBoard)

module.exports = dashBoard