const express = require('express')
const supervisor = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()

supervisor.use(express.json())
supervisor.use(cors())

const appNewStore = require('../controller/supervisor/newStore')

supervisor.use('/approve',appNewStore)

module.exports = supervisor