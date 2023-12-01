const express = require('express')
const route = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()

route.use(express.json())
route.use(cors())


const addRoute = require('../controller/route/addRoute')
const getRoute = require('../controller/route/getRoute')

route.use('/',addRoute)
route.use('/',getRoute)

module.exports = route