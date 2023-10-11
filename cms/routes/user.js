const express = require('express')
const logger = require('../logger/logger')
// const { currentdateDash, currentdateSlash,currentdate,currenttime } = require('../utils/utility');
const userResponse = express.Router();

userResponse.get('/200', async (req, res) => {
    //logger.info('This is info log')
    res.status(200).json(200)
})

userResponse.get('/400', async (req, res) => {
  //  logger.warn('This is warn log')
    res.status(400).json(400) 
})

userResponse.get('/500', async (req, res) => {
 //   logger.error('This is error log')
    res.status(500).json(500)
})



userResponse.get('/error', async (req, res,next) => {
    try {
        throw new Error('Data is not define') 
    } catch (error) {
        next(error);
    }
})

module.exports = userResponse