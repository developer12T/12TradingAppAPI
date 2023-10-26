const express = require('express')
const checkin = express()
const cors = require('cors')

require('dotenv').config()

checkin.use(express.json())
checkin.use(cors())


const getCheckIn = require('../controller/checkin/getCheckIn')
const addCheckIn = require('../controller/checkin/addCheckIn')

checkin.use('/getCheckIn',getCheckIn)
checkin.use('/addCheckIn',addCheckIn)

module.exports = checkin