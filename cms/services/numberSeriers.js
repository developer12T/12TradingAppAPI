const {NumberSeries} = require("../models/numberSeries");
const {History} = require('../models/history')
const {Store} = require("../models/store");


async function available(type, zone) {
    const data = await NumberSeries.findOne({
        type: type,
        zone: zone
    }).sort({'detail.available': -1}).select('detail.available').exec()
    // console.log(data.detail.available)
    return data.detail.available
}

async function updateAvailable(type,zone,number){
    const { currentdateDash }= require('../utils/utility')
    const filter = { type: type, zone:zone }
    const update = { 'detail.available': number }
    const result = await NumberSeries.updateOne(filter, update)

    const newHistory = new History({type:'updateNumber',collectionName:'NumberSeries',description:`update type:${type} zone:${zone} NumberSeries:${number-1} date:${currentdateDash()}`})
    await newHistory.save()

    return result.nModified
}

module.exports = {
    available,
    updateAvailable
};