const http = require('http')
const app = require('./app')
const dotenv = require('dotenv')
const connectDB = require('./cms/configs/connect')
dotenv.config();

const { PORT } = process.env;

const server = http.createServer(app)

app.get('/testApi', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`server start on port ${PORT}`);
    })
  }) 
  .catch((error) => {
    console.error('Error connecting to the database:', error)
  })