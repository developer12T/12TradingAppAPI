const express = require('express')
const route = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()

route.use(express.json())
route.use(cors())


const addRoute = require('../controller/route/addRoute')
const getRoute = require('../controller/route/getRoute')
const updateRoute = require('../controller/route/updateRoute')

route.use('/',addRoute)
route.use('/',getRoute)
route.use('/',updateRoute)

module.exports = route