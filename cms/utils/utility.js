
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

  
  module.exports = {
    currentdateDash,
    currentdateSlash,
    currentdate,
    currenttime,
    currentdatena,
    currentdateFormatYearMont,
    spltitString
  };