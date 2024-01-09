
const moment = require('moment'); 

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

async function spltitString(id) {
  const regex = /([A-Za-z]+)(\d+)/
  const match = id.match(regex)
  const result = {
    prefix: match[1],
    subfix: match[2]
  }
  return result
}


function checkDistanceLatLon(lat1, lon1, lat2, lon2, unit) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist;
  }
}

async function calPromotion(totalPurchase,buy,free){
  const setsOfThree = Math.floor(totalPurchase / buy)
  return setsOfThree * free
}

// async function converting(idProduct,qty,unitIdBuy) {
//     const dataUnit
//     return dist;
// }




module.exports = {
    // converting,
    currentdateDash,
    currentdateSlash,
    currentdate,
    currenttime,
    currentdatena,
    currentdateFormatYearMont,
    spltitString,
    checkDistanceLatLon,
    calPromotion
  };