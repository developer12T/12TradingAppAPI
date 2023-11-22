const {Store} = require('../../cms/models/store');

const newStore = (io) => {
    io.on('connection', (socket) => {
        console.log({status:204,message:'Client Connected!'})

        //check data and emit to Client
        Store.find().then((data) => {
            socket.emit('newStore', data)
        })

        socket.on('disconnect', () => {
            console.log({status: 900, message: 'Client disconnected!'})
        })

        //find data
        const checkNewStore = async () => {
            const data = await Store.find()
            io.emit('newStore', data)
        }

        setInterval(checkNewStore, 5000)
    })
}

module.exports = newStore
