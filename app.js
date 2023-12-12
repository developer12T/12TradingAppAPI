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
const {ErrorLog} = require("./cms/models/errorLog");
const {currentdateDash} = require("./cms/utils/utility");

// app.use('/cms', async (req , res ,next)=>{
//     // console.log(res)
//     await ErrorLog.create({status:500,pathApi:req.originalUrl,dataBody:req.body,dateCreate:currentdateDash(),message:req.method})
//     next();
// },express.static('public'))

// app.use('/cms', async (req, res, next) => {
//     const originalSend = res.send
//     res.send = function (body) {
//         const logData = {
//             status: res.statusCode,
//             pathApi: req.originalUrl,
//             dataBody: req.body,
//             dateCreate: currentdateDash(),
//             message: res.statusMessage,
//             method: req.method
//         }
//         ErrorLog.create(logData)
//             .then(() => {
//                 originalSend.call(res, body)
//             })
//             .catch(error => {
//                 console.error('Error logging:', error)
//                 originalSend.call(res, body)
//             })
//     }
//     next()
// }, express.static('public'))

app.use('/cms',cms)

module.exports = app