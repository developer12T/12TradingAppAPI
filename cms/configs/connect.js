const mongoose = require('mongoose') ;
const dotenv = require('dotenv')
dotenv.config() 

const { CONNECT_STRING } = process.env;

const connectDB = async () => {
    try {
      await mongoose.connect(CONNECT_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB Success');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error; 
    }
  };

module.exports = connectDB