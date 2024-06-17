const express = require('express')
const auth = require('./cms/controller/authen/middleware/authen')
const app = express()
const cors = require('cors')
app.use(express.json())

app.use(cors())

// app.use('/cms', (req, res, next) => {
//     console.log(req.path)
//     if (req.path === '/authen/login') { // ยกเว้น api ให้ใช้ next()
//         next()
//     } else {
//         auth(req, res, next)
//     }
// }, express.static('public'))

// const verifyToken = require('./cms/controller/authen/middleware/authen');
const cms = require('./cms/index')

app.use('/cms',cms)

module.exports = app