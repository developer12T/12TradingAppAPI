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
const UserManage = require('../controller/manage/user')
const ProductManage = require('../controller/manage/product')
const UnitManage = require('../controller/manage/unit')
const statusDesManage = require('../controller/manage/statusDes')

manage.use('/TypeStore',TypeStore)
manage.use('/NumberSeries',numberSeries)
manage.use('/Address',address)
manage.use('/User',UserManage)
manage.use('/Product',ProductManage)
manage.use('/Unit',UnitManage)
manage.use('/StatusDes',statusDesManage)

module.exports = manage