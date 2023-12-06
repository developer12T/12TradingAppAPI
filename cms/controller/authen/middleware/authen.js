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
const  lockData = process.env.TOKEN_KEY_ACCESS_LOCK
    const token = authHeader.split(' ')[1]
    // const

process.env.ALGORITHYM_DECODED

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