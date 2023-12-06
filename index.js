const http = require('http')
const app = require('./app')
const dotenv = require('dotenv')
const connectDB = require('./cms/configs/connect')
dotenv.config()

const { PORT } = process.env;


const newStore = require('./dataRealtime/cms/newStore')
// const server = http.createServer(app)


const server = http.createServer(app)

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST","PUT"]
    }
})

app.get('/testApi', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});


newStore(io)
connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`server start on port ${PORT}`)
    })
  }) 
  .catch((error) => {
    console.error('Error connecting to the database:', error)
  })