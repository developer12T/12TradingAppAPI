const express = require('express')
const auth = require('./cms/controller/authen/middleware/authen')
const app = express()
const cors = require('cors')
app.use(express.json())


require('winston-mongodb')

app.use(cors())

// app.use('/cms', (req, res, next) => {
//     if (req.path === '/authen/saleAuthen/login') {
//         // console.log(req.path)
//         next();
//     } else {
//         // ตรวจสอบ Token สำหรับเส้นทางอื่น ๆ ใน /cms
//         auth(req, res, next);
//     }
// }, express.static('public'))

const verifyToken = require('./cms/controller/authen/middleware/authen');
const cms = require('./cms/index')

app.use('/cms',cms)

module.exports = app