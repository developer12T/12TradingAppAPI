const express = require('express')
require('../../configs/connect')
const User = express.Router()
const { TypeStore } = require('../../models/store')
const {currentdateDash} = require("../../utils/utility");

User.post('/getAll', async(req, res) => {

        res.status(500).json('error adad')

})

module.exports = User

