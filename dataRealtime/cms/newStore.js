const {Store} = require('../../cms/models/store')

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

        //find data
        const checkNewStore = async () => {
            const data = await Store.find({'approve.status':'1'})
            io.emit('newStore', data)
        }

        setInterval(checkNewStore, 2000)
    })
}
module.exports = newStore
