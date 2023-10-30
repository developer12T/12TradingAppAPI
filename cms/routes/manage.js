const express = require('express')
const manage = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()

manage.use(express.json())
manage.use(cors())

const TypeStore = require('../controller/manage/typeStore')
const numberSeries = require('../controller/manage/numberSeries')
const address = require('../controller/manage/address')
const User = require('../controller/manage/user')

manage.use('/TypeStore',TypeStore)
manage.use('/NumberSeries',numberSeries)
manage.use('/Address',address)
manage.use('/User',User)

module.exports = manage