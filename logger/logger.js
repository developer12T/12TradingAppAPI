const { createLogger,format,transports } = require('winston')
const {currentdateDash} = require('../utils/utility')
require('dotenv').config()
const logger = createLogger({
    transports:[
        // new transports.Console(),
        new transports.File({
            level:'warn',
            filename:'logger/logsWarning.log'
        }), 
        new transports.File({
            level:'error',
            filename:'logger/logsErrors.log'
        }),
       new transports.MongoDB({
        db:process.env.CONNECT_STRING,
        collection:'logs'
       })
    ],
    format:format.combine(
        format.json(),
        format.timestamp(currentdateDash()),
        format.metadata(),
        format.prettyPrint()
        )
})

module.exports = logger