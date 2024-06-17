const http = require('http')
const app = require('./app')
const dotenv = require('dotenv')
const connectDB = require('./cms/configs/connect')

dotenv.config()

const { PORT } = process.env;

const newStore = require('./dataRealtime/cms/newStore')
// const server = http.createServer(app)

const server = http.createServer(app)

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST','PUT']
    }
})

newStore(io)
connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`\x1b[33mserver\x1b[0m \x1b[31mstart \x1b[35mon\x1b[0m \x1b[36mport\x1b[0m \x1b[34m${PORT}\x1b[0m`)
    })
}).catch((error) => {
    console.error('Error connecting to the database:', error)
})