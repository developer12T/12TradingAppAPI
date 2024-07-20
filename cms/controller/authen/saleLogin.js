
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('../../configs/connect')
const saleLogin = express.Router()
const {Route, Checkin} = require('../../models/route')
const {User} = require("../../models/user");
const {createLog} = require("../../services/errorLog");
//
// saleLogin.post('/login', async (req, res) => {
//     try {
//         const data = await User.findOne({nameUser:req.body.userName})
//         if(!data){
//             res.status(507).json({
//                 status:507,
//                 massage:'Validation failed'
//             })
//         }else{
//             if(data.passWord === req.body.passWord){
//                 const token = jwt.sign(
//                     { username: data.nameUser },
//                     process.env.TOKEN_KEY,
//                     { expiresIn: '12h' })
//
//                 res.status(200).json({
//                     status:200,
//                     massage:'log in complete',
//                     data:{
//                         firstName:data.firstName,
//                         surName:data.surName,
//                         fullName:data.firstName + ' '+data.surName,
//                         role:data.description.role,
//                         area:data.description.area,
//                         status:data.status,
//                         token:token
//                     }
//                 })
//             }else{
//                 res.status(507).json({
//                     status:507,
//                     massage:'Validation failed'
//                 })
//             }
//
//         }
//
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             status: 500,
//             massage: error.message
//         })
//     }
// })

saleLogin.post('/login', async (req, res) => {
    try {
        const data = await User.findOne({userName: req.body.userName});
        if (!data) {
            res.status(507).json({
                status: 507,
                message: 'Validation failed'
            });
        } else {
            const passwordMatch = await bcrypt.compare(req.body.passWord,data.passWord)
            console.log( passwordMatch)
            if (passwordMatch) {
                const token = jwt.sign(
                    {username: data.userName},
                    process.env.TOKEN_KEY,
                    {expiresIn: '12h'}
                );

                await createLog('200',req.method,req.originalUrl,res.body,'log in complete')
                res.status(200).json({
                    status: 201,
                    message: 'log in complete',
                    data: {
                        userName: data.userName,
                        firstName: data.firstName,
                        surName: data.surName,
                        fullName: data.firstName + ' ' + data.surName,
                        role: data.role,
                        saleCode: data.saleCode,
                        salePayer: data.salePayer                        ,
                        area: data.area,
                        zone:data.zone,
                        token: token
                    }
                });
            } else {
                await createLog('507',res.method,req.originalUrl,res.body,'Validation failed')
                res.status(507).json({
                    status: 507,
                    message: 'Validation failed'
                })

            }
        }
    } catch (error) {
        console.log(error);
        await createLog('500',res.method,req.originalUrl,res.body,error.stack)
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
});
module.exports = saleLogin
