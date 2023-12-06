const express = require('express')
const auth = require('./cms/controller/authen/middleware/authen')
const app = express()
const cors = require('cors')
app.use(express.json())

const {currentdateDash} = require('./cms/utils/utility')

const expressWinston = require('express-winston')
const {transports, format} = require('winston')
require('winston-mongodb')

const logger = require('./cms/logger/logger')

app.use(cors())

// app.use(expressWinston.logger({
//     winstonInstance: logger,
//     statusLevels: true
// }))

// const errFormat = format.printf(({level, meta}) => {
//     return `${currentdateDash()} ${level}:${meta.message}`
// })

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


// app.use(expressWinston.errorLogger({
//     transports: [
//         new transports.File({
//             level: 'error',
//             filename: 'logger/logsInternalErrors.log',
//             options: {
//                 level: 'error'
//             },
//             format: format.combine(
//                 format.timestamp({format: currentdateDash()}),
//                 format.json(),
//                 errFormat
//             )
//         }),
//         new transports.MongoDB({
//             db: process.env.CONNECT_STRING,
//             collection: 'logs',
//             options: {
//                 level: 'error',
//             },
//             format: format.combine(
//                 format.timestamp({format: currentdateDash()}),
//                 format.json(),
//                 format.metadata(errFormat)
//             )
//         })
//     ]
// }))

module.exports = app