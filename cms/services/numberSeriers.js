const { NumberSeries } = require("../models/numberSeries")
const { History } = require('../models/history')
const { Store } = require("../models/store")

async function available(year, type, zone) {
    const data = await NumberSeries.findOne({
        year,
        type,
        zone
    }).sort({ 'detail.available': -1 }).select('detail.available').exec()
    // console.log(data)
    return data.detail.available
}

async function updateAvailable(year, type, zone, number) {
    const { currentdateDash } = require('../utils/utility')
    const filter = { year: year, type: type, zone: zone }
    const update = { 'detail.available': number }
    const result = await NumberSeries.updateOne(filter, update)

    const newHistory = new History({ type: 'updateNumber', collectionName: 'NumberSeries', description: `update type:${type} zone:${zone} NumberSeries:${number - 1} date:${currentdateDash()}` })
    await newHistory.save()

    return result.nModified
}

module.exports = {
    available,
    updateAvailable
}