const express = require('express')
const cms = express.Router()

const store = require('./routes/store')
const route = require('./routes/route')
const manage = require('./routes/manage')
const supervisor = require('./routes/supervisor')
const checkin = require('./routes/checkin')

cms.use('/store',store)
cms.use('/route',route)
cms.use('/manage',manage)
cms.use('/supervisor',supervisor)
cms.use('/checkin',checkin)

module.exports = cms
