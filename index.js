const http = require('http')
const app = require('./routes/app')
const dotenv = require('dotenv')
const connectDB = require('./configs/connect')
dotenv.config();

const { PORT } = process.env;

const server = http.createServer(app)
const store = require('./routes/store')
const manage = require('./routes/manage')
const supervisor = require('./routes/supervisor')

app.get('/testApi', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use('/store',store)
app.use('/manage',manage)
app.use('/supervisor',supervisor)

connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`server start on port ${PORT}`);
    });
  }) 
  .catch((error) => {
    console.error('Error connecting to the database:', error)
  });