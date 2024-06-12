const express = require('express')
const printOrder = express.Router()
const escpos = require('escpos')
const BluetoothSerialPort = require('bluetooth-serial-port').BluetoothSerialPort
const iconv = require('iconv-lite')
const { createLog } = require('../../services/errorLog')

const connectAndPrint = (dataToPrint) => {
    return new Promise((resolve, reject) => {
        const btSerial = new BluetoothSerialPort();

        btSerial.on('found', function (address, name) {
            console.log('Found:', name);
            if (name === 'SPP-R410') {
                btSerial.findSerialPortChannel(address, function (channel) {
                    console.log('Found channel:', channel);
                    btSerial.connect(address, channel, function () {
                        console.log('Connected to device');
                        const device = {
                            write: btSerial.write.bind(btSerial),
                            close: btSerial.close.bind(btSerial)
                        };
                        const printer = new escpos.Printer(device);

                        const encodedText = iconv.encode(dataToPrint, 'CP874');

                        device.write(encodedText, (err) => {
                            if (err) {
                                reject('Error writing to printer: ' + err);
                            } else {
                                printer
                                    .cut()
                                    .close(() => {
                                        console.log('Print completed');
                                        resolve('Printed successfully');
                                    });
                            }
                        });
                    }, function () {
                        reject('Cannot connect to device');
                    });
                }, function () {
                    reject('No suitable channel found');
                });
            }
        });

        btSerial.on('finished', function () {
            console.log('Scan finished.');
            reject('Device not found');
        });

        btSerial.inquire();
    });
};

printOrder.post('/printTest', async (req, res) => {
    const { data } = req.body;
    try {
        console.log('printTest1');
        const result = await connectAndPrint(data);
        console.log('printTest2');
        res.status(200).send({ status: 200, message: result });
    } catch (error) {
        await createLog('500', req.method, req.originalUrl, res.body, error.message)
        res.status(500).json({
            status: 500,
            message: error.message
        })
    }
})

module.exports = printOrder