const express = require('express')
const jwt = require('jsonwebtoken')
require('../../configs/connect')
const saleLogin = express.Router()
const {Route, Checkin} = require('../../models/route')
const {User} = require("../../models/user");

saleLogin.post('/login', async (req, res) => {
    try {
        const data = await User.findOne({nameUser:req.body.userName})
        if(!data){
            res.status(507).json({
                status:507,
                massage:'Validation failed'
            })
        }else{
            if(data.passWord === req.body.passWord){
                const token = jwt.sign(
                    { username: data.nameUser },
                    process.env.TOKEN_KEY,
                    { expiresIn: '12h' })

                res.status(200).json({
                    status:200,
                    massage:'log in complete',
                    data:{
                        firstName:data.firstName,
                        surName:data.surName,
                        fullName:data.firstName + ' '+data.surName,
                        role:data.description.role,
                        area:data.description.area,
                        status:data.status,
                        token:token
                    }
                })
            }

        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            massage: error.message
        })
    }
})

module.exports = saleLogin
