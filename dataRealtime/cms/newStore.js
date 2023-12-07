const {Store} = require('../../cms/models/store')
const axios = require("axios");

const newStore = (io) => {
    io.on('connection', (socket) => {
        console.log({status: 204, message: 'Client Connected!'})

        //check data and emit to Client
        Store.find().then((data) => {
            socket.emit('newStore', data)
        })
        socket.on('disconnect', () => {
            console.log({status: 900, message: 'Client Disconnected!'})
        })

        socket.on('newStore', (data) => {
            const areaData = data.area;
            checkNewStore(areaData);
        });

        //find data
        const checkNewStore = async (area) => {
            // console.log('area : '+area)
            // const data = await Store.find({area:area})
            // io.emit('newStore', data)
        }

        setInterval(checkNewStore, 2000)
    })
}
module.exports = newStore
