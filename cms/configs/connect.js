const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { CONNECT_STRING } = process.env;

const connectDB = async () => {
    try {
        let progress = 0;
        const totalSteps = 10; // จำนวนขั้นตอนทั้งหมดที่คาดว่าจะใช้

         await mongoose.connect(CONNECT_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const interval = await setInterval(() => {
            progress += 1;
            const percentage = (progress / totalSteps) * 100;
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`\x1b[35mConnecting Database... ${percentage.toFixed(2)}%\x1b[0m`);

            if (progress === totalSteps) {
                clearInterval(interval);
                console.log('\n\x1b[35mConnected to MongoDB Success\x1b[0m');
            }
        }, 70); // ปรับความถี่ของการอัพเดทตามต้องการ
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

module.exports = connectDB;
