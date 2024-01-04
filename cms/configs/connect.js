const mongoose = require('mongoose') 
const dotenv = require('dotenv')
dotenv.config() 

const { CONNECT_STRING } = process.env

const connectDB = async () => {
    try {
      await mongoose.connect(CONNECT_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('\x1b[35mConnected to MongoDB Success\x1b[0m')
    } catch (error) {
      console.error('Error connecting to MongoDB:', error)
      throw error
    }
  };

module.exports = connectDB