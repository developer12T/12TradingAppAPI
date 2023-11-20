const express = require('express')

const auth = require('./cms/controller/authen/middleware/authen')
const app = express()
const cors = require('cors')
app.use(express.json())

const {currentdateDash} = require('./cms/utils/utility')

const expressWinston = require('express-winston')
const { transports,format } = require('winston')
require('winston-mongodb')

const logger = require('./cms/logger/logger')

app.use(cors())

app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels:true
}))

const errFormat = format.printf(({level,meta}) => {
    return `${currentdateDash()} ${level}:${meta.message}`
})


const cms = require('./cms/index')


app.use('/cms', cms)


app.use(expressWinston.errorLogger({
    transports: [
        new transports.File({
            level: 'error',
            filename: 'logger/logsInternalErrors.log',
            options:{
                level: 'error'
            },
            format:format.combine(
                format.timestamp({ format: currentdateDash() }),
                format.json(),
                errFormat
            )
        }),
        new transports.MongoDB({
            db: process.env.CONNECT_STRING,
            collection: 'logs',
            options: {
                level: 'error',
            },
            format: format.combine(
                format.timestamp({ format: currentdateDash() }),
                format.json(),
                format.metadata(errFormat)
            )
        })
    ]
}))

module.exports = app