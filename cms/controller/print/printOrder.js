const express = require('express')
const printOrder = express.Router()
const escpos = require('escpos')
const btSerial = new(require('bluetooth-serial-port')).BluetoothSerialPort()

const printReceipt = (items, total, date) => {
    btSerial.findSerialPortChannel('BixolonPrinter', function (channel) {
        btSerial.connect('BixolonPrinter', channel, function () {
            const device = new escpos.Bluetooth(btSerial);
            const printer = new escpos.Printer(device);

            device.open(() => {
                printer
                    .align('ct')
                    .text('ร้านค้า', 'utf8')
                    .text('ใบเสร็จรับเงิน', 'utf8')
                    .text(`วันที่: ${date}`, 'utf8')
                    .text('รายการสินค้า', 'utf8');

                items.forEach(item => {
                    printer.text(`${item.name}    ${item.price} บาท`, 'utf8');
                });

                printer
                    .text(`รวมทั้งหมด ${total} บาท`, 'utf8')
                    .cut()
                    .close();
            });
        }, function () {
            console.log('cannot connect');
        });

        btSerial.close();
    }, function () {
        console.log('found nothing');
    });
};

const connectAndPrint = (dataToPrint) => {
    return new Promise((resolve, reject) => {
      const btSerial = new bluetooth.BluetoothSerialPort();
      
      btSerial.on('found', function(address, name) {
        if (name === 'Bixolon SPP-R410') {
          btSerial.findSerialPortChannel(address, function(channel) {
            btSerial.connect(address, channel, function() {
              const device = new escpos.Console(btSerial);
              const options = { encoding: "GB18030" }
              const printer = new escpos.Printer(device, options);
  
              device.open(function() {
                printer
                  .text(dataToPrint)
                  .cut()
                  .close();
                resolve('Printed successfully');
              });
            }, function () {
              reject('Cannot connect to device');
            });
          }, function() {
            reject('Found nothing');
          });
        }
      });
  
      btSerial.inquire();
    });
  };

  
printOrder.post('/orderPrint', async (req, res) => {
    try {
        const { items, total, date } = req.body;
        printReceipt(items, total, date);
        res.status(200).send('Printing receipt...');
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

printOrder.post('/printTest', async (req, res) => {
    const { data } = req.body;
    try {
      const result = await connectAndPrint(data);
      res.status(200).send(result);
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = printOrder