
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

  
  module.exports = {
    currentdateDash,
    currentdateSlash,
    currentdate,
    currenttime,
    currentdatena
  };