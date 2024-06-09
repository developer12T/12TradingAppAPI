const bluetooth = require('bluetooth-serial-port');

const btSerial = new bluetooth.BluetoothSerialPort();

btSerial.on('found', function(address, name) {
  console.log('Found: ' + name + ' with address ' + address);
});

btSerial.on('finished', function() {
  console.log('Scan finished.');
});

btSerial.inquire();
