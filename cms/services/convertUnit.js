/*
 * Copyright (c) 2567. by develop 12Trading
 */

const { Product } = require('../models/product')

async function convertUnit(id,unitId) {
    const convertChange = await Product.findOne({
        id:id,
        convertFact: { $elemMatch: {unitId:unitId}}
    }, {'convertFact.$': 1})

    // const convertChange = await Product.findOne({
    //     id:id,
    // }, {'convertFact': 1})
    return convertChange
}
module.exports = {
    convertUnit,
}