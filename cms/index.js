const express = require('express')
const cms = express.Router()

const store = require('./routes/store')
const manage = require('./routes/manage')
const supervisor = require('./routes/supervisor')

cms.use('/store',store)
cms.use('/manage',manage)
cms.use('/supervisor',supervisor)

module.exports = cms
