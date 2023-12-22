const express = require('express')
const promotion = express()
const cors = require('cors')

require('dotenv').config()

promotion.use(express.json())
promotion.use(cors())

const addPromotion = require('../controller/promotion/addPromotion')
const getPromotion = require('../controller/promotion/getPromotion')
const optionData = require('../controller/promotion/optionData')

promotion.use('/',addPromotion)
promotion.use('/',getPromotion)
promotion.use('/',optionData)

module.exports = promotion