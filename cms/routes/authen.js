const express = require('express')
const authen = express()
const cors = require('cors')

require('dotenv').config()

authen.use(express.json())
authen.use(cors())


const saleLogin = require('../controller/authen/saleLogin')

authen.use('/authen',saleLogin)

module.exports = authen