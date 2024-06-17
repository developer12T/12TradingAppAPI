const express = require('express')
const auth = require('./cms/controller/authen/middleware/authen')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())

// app.use('/cms', (req, res, next) => {
//     console.log(req.path)
//     if (req.path === '/authen/login') { // ยกเว้น api ให้ใช้ next()
//         next()
//     } else {
//         auth(req, res, next)
//     }
// }, express.static('public'))

// const verifyToken = require('./cms/controller/authen/middleware/authen');
const cms = require('./cms/index')
app.use('api/cms',cms)

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/logmonitor/index.html')
})

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/logmonitor/dashboard.html')
})

module.exports = app