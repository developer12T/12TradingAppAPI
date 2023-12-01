const express = require('express')
const store = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()

store.use(express.json())
store.use(cors())

const getStore = require('../controller/store/getStore')
const addStore = require('../controller/store/addStore')

store.use('/',getStore)
store.use('/',addStore)

module.exports = store