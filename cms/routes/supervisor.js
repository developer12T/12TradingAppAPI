const express = require('express')
const supervisor = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()

supervisor.use(express.json())
supervisor.use(cors())

const appNewStore = require('../controller/supervisor/order/newStore')
const getNewStore = require('../controller/supervisor/order/getNewStore')
const getNewGiveProduct = require('../controller/supervisor/giveProduct/getNewGiveProduct')
const newGiveProduct = require('../controller/supervisor/giveProduct/newGiveProduct')

supervisor.use('/approve',appNewStore)
supervisor.use('/approve',newGiveProduct)
supervisor.use('/',getNewStore)
supervisor.use('/giveProduct',getNewGiveProduct)

module.exports = supervisor