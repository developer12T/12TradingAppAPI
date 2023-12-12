const express = require('express')
const promotion = express()
const cors = require('cors')

require('dotenv').config()

promotion.use(express.json())
promotion.use(cors())

const addPromotion = require('../controller/promotion/addPromotion')

promotion.use('/',addPromotion)

module.exports = promotion