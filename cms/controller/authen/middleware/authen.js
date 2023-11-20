const jwt = require('jsonwebtoken')

const config = process.env

const refreshExpiry = (token) => {
    const decoded = jwt.decode(token);
    if (decoded) {
        const now = Date.now() / 1000; // Convert to seconds
        const newExpiry = now + (2 * 60 * 60); // 2 hours from now
        const refreshedToken = jwt.sign({...decoded, exp: newExpiry}, config.TOKEN_KEY);
        return refreshedToken;
    }
    return null;
};


const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization']
    if (!authHeader) {
        var token = req.body.token || req.query.token || req.headers['x-access-token']
    } else {
        var token = authHeader && authHeader.split(' ')[1]
    }

    if (!token) {
        return res.status(400).json('require token')
    }

    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY)
        req.user = decoded

        // Refresh token expiry
        const refreshedToken = refreshExpiry(token)
        if (refreshedToken) {
            res.setHeader('refreshed-token', refreshedToken)
        }

        next()
    } catch (error) {
        return res.status(500).json('Invalid token')
    }
}

module.exports = verifyToken