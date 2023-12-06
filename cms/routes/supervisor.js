const express = require('express')
const supervisor = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()

supervisor.use(express.json())
supervisor.use(cors())

const appNewStore = require('../controller/supervisor/order/newStore')
const getNewStore = require('../controller/supervisor/order/getNewStore')

supervisor.use('/approve',appNewStore)
supervisor.use('/',getNewStore)

module.exports = supervisor