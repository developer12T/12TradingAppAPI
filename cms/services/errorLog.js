const {currentdateDash} = require("../utils/utility")
const {ErrorLog} = require("../models/errorLog")
async function createLog(status,method,pahtApi,dataBody,message) {
    await ErrorLog.create({
            status: status,
            method:  method,
            pathApi: pahtApi,
            dataBody: dataBody,
            message:message,
            dateCreate: currentdateDash()
    })
}

module.exports = {
    createLog,
}