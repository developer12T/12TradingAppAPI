const moment = require('moment');
const fs = require("fs");
const {Product} = require("../models/product");
const {Route} = require("../models/route");

function currentdateDash() {
    const datedash = moment().format('YYYY-MM-DDTHH:mm:ss', 'th');
    return datedash
}

function currentdateSlash() {
    const dateslash = moment().format('YYYY/MM/DDTHH:mm:ss', 'th');
    return dateslash
}

function currentdate() {
    const date = moment().format('YYYY/MM/DD', 'th');
    return date
}

function currentDateDDMMYY() {
    const date = moment().format('DD/MM/YYYY', 'th');
    return date
}

function currenttime() {
    const time = moment().format('HH:mm:ss', 'th');
    return time
}

function currentdatena() {
    const dateslash = moment().format('YYYYMMDDTHH-mm-ss', 'th');
    return dateslash
}

function currentdateFormatYearMont() {
    const date = moment().format('YYYYMM', 'th');
    return date
}

function currentYear() {
    const date = moment().format('YYYY', 'th');
    return date
}

function currentYearToDigi() {
    const date = moment().format('YY', 'th');
    return date
}

function currentMonth() {
    const date = moment().format('MM', 'th');
    return date
}

async function spltitString(id) {
    const regex = /([A-Za-z]+)(\d+)/
    const match = id.match(regex)
    const result = {
        prefix: match[1],
        subfix: match[2]
    }
    return result
}


async function checkDistanceLatLon(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") {
            dist = dist * 1.609344
        }
        if (unit == "N") {
            dist = dist * 0.8684
        }
        return dist;
    }
}

async function calPromotion(totalPurchase, buy, free) {
    const setsOfThree = Math.floor(totalPurchase / buy)
    return setsOfThree * free
}


async function nameMonth() {
    const fs = require('fs')
    let rawdata = fs.readFileSync('cms/utils/monthName.json');
    let month = JSON.parse(rawdata);
    // console.log(month)
    return month;
}

async function floatConvert(number,digit) {
    return parseFloat(parseFloat(number).toFixed(digit));
}

async function getDayOfRoute(idRoute) {
    const dataArea = await Route.findOne({id:idRoute}, {_id: 0,area:1})
    // console.log(dataArea.area + 'AAAAA')
    const data = await Route.find({area:dataArea.area}, {_id: 0}).exec()
    let dayReturn = 'Day error'
    for (let i = 0; i < data.length; i++) {
        const day = (i + 1 < 10) ? '0' + (i + 1) : (i + 1)
        if(data[i].id === idRoute){
            dayReturn = "Day " + day
        }
    }
    return dayReturn
}


async function dayOfMonth(monthNumber) {
    const fs = require('fs')
    let rawdata = fs.readFileSync('cms/utils/monthName.json')
    let month = JSON.parse(rawdata)
    let monthArray = []
    let monthObj = {}
    let febNumber = 0
    for (const list of month.month) {
        // console.log(list.number)
        if(list.number === '02'){
            if( (parseInt(moment().format('YYYY', 'th')) % 4) === 0){
                febNumber = '29'
            }else{
                febNumber = '28'
            }
            monthArray.push({
                month: list.number,
                numberOfDay: febNumber
            })
        }else{
            monthArray.push({
                month: list.number,
                numberOfDay: list.numberOfDay
            })
        }
    }

    for(const list of monthArray ){
        if(monthNumber == list.month){
            monthObj = {
                month:list.month,
                numberOfDay:list.numberOfDay
            }
        }
    }
    return monthObj
}

// async function converting(idProduct,qty,unitIdBuy) {
//     const dataUnit
//     return dist;
// }
// async function convertUnitToCTN(smallest_unit,unitQty,id) {
//     // const smallest_unit
//     const convertChange = await Product.findOne({
//         id: id,
//         convertFact: {$elemMatch: {unitId: convertDataSub.unitQty}}
//     }, {'convertFact.$': 1,_id:0})
//     return 'dist';
// }




module.exports = {
    // converting,
    currentDateDDMMYY,
    currentYearToDigi,
    currentdateDash,
    currentdateSlash,
    currentYear,
    currentMonth,
    dayOfMonth,
    floatConvert,
    currentdate,
    currenttime,
    currentdatena,
    currentdateFormatYearMont,
    spltitString,
    checkDistanceLatLon,
    calPromotion,
    nameMonth,
    getDayOfRoute
    // convertUnitToCTN
};