
const { Unit } = require('../models/product')

async function takeNameEng(id) {
    const data = await Unit.findOne({idUnit:id})
    return data.nameEng
}
async function takeNameThai(id) {
    const data = await Unit.findOne({idUnit:id})
    return data.nameThai
}
module.exports = {
    takeNameEng,
    takeNameThai,
}