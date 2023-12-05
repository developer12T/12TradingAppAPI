const express = require('express')
const app = express()
const cors = require('cors')
const {currentdateDash} = require('../utils/utility')

const expressWinston = require('express-winston')
const { transports,format } = require('winston')
require('winston-mongodb')

const logger = require('../logger/logger')

require('dotenv').config()

app.use(express.json())

app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels:true 
}))

app.use(cors())

const userResponse = require('./user')

app.use('/user',userResponse)

const errFormat = format.printf(({level,meta}) => {
    return `${currentdateDash()} ${level}:${meta.message}`
})

// app.use(expressWinston.errorLogger({
//     transports: [
//         new transports.File({
//             level: 'error',
//             filename: 'logger/logsInternalErrors.log',
//             options:{
//                 level: 'error'
//             },
//             format:format.combine(
//                 format.timestamp({ format: currentdateDash() }),
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
//                 format.timestamp({ format: currentdateDash() }),
//                 format.json(),
//                 format.metadata(errFormat)
//             )
//         })
//     ]
// }))

module.exports = app
