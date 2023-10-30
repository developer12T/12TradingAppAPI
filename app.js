const express = require('express')

const app = express()
const cors = require('cors')
app.use(express.json())

  app.use(cors())

//manageUser
const cms = require('./cms/index')

app.use('/cms',cms)

module.exports = app