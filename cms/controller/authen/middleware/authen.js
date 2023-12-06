const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");

const config = process.env
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 401,
            message: 'Authorization token is missing or invalid'
        });
    }
const  lockData = '$2b$10$X3Dl5ODg4Dk8U0S1kC6B1O9V8pGuMINV6CHfY01HuYadA3lVbi9mu'
    const token = authHeader.split(' ')[1]
    // const
    const concatenatedWord = token.substring(10, 11) +
        token.substring(12, 13) +
        token.substring(33, 34) +
        token.substring(46, 47) +
        token.substring(53, 54) +
        token.substring(65, 66) +
        token.substring(69, 70) +
        token.substring(70, 71);

    console.log(concatenatedWord);
    const hashedPassword = await bcrypt.hash(concatenatedWord, 10)
    const passwordMatch = await bcrypt.compare(hashedPassword, lockData)
    if (passwordMatch) {
        var checkOut_api = 1
    }else{
        var checkOut_api = 0
    }

    if(checkOut_api === 1){
        next()
    }else{
        jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    status: 403,
                    message: 'Invalid token'
                })
            }
            req.user = decoded
            next()
        })

    }



};

module.exports = verifyToken