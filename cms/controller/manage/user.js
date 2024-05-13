const express = require('express')
require('../../configs/connect')
const  bcrypt  = require('bcryptjs')
const UserManage = express.Router()
const {User} = require('../../models/user')
// const {updateAvailable} = require("../../services/numberSeriers");
 const {createLog} = require("../../services/errorLog");
// const {currentYear} = require("../../utils/utility");

UserManage.post('/getAll', async (req, res) => {
    try{
        const data = await User.find({},{_id:0,__v:0})
        res.status(200).json(data)
    }catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

UserManage.post('/getDetail', async (req, res) => {
    try{
        const data = await User.findOne({id:req.body.id},{_id:0,__v:0,passWord:0})
        await createLog('200',req.method,req.originalUrl,res.body,'getDetail User Successfully!')
        res.status(200).json(data)
    }catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

UserManage.post('/addUser', async (req, res) => {
    try{
        let {saleCode,salePayer,userName,firstName,surName,passWord,area,role,zone} = req.body
        const hashedPassword = await bcrypt.hash(passWord, 10)
        // const  { available } = require('../../services/numberSeriers')
        // const { currentYear } = require('../../utils/utility')
        const mainData = {
            // id:await available(currentYear(),'userNumber','cms'),
            saleCode,
            salePayer,
            userName,
            firstName,
            surName,
            passWord:hashedPassword,
            area,
            role,
            zone,
            status:"1",
        }

        const checkUser = await User.findOne({userName})
        if(checkUser){
            await createLog('200',req.method,req.originalUrl,res.body,'Added User Successfully')
            res.status(200).json({status:500,message:'Replace UserName!'})
        }else{
            await User.create(mainData)
            await createLog('200',req.method,req.originalUrl,res.body,'Added User Successfully')
            res.status(200).json({status:201,message:'Added User Successfully'})
        }
        // await updateAvailable('2024','userNumber','cms',await available(currentYear(),'userNumber','cms')+1)
    }catch (e) {
        console.log(e)
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

UserManage.post('/changePassword', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.newPassWord, 10)
        const update = await User.updateOne({id: req.body.id}, {$set: {passWord: hashedPassword}})
        await createLog('200',req.method,req.originalUrl,res.body,'changePassword User Successfully!')
        res.status(200).json(update)
    }catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

UserManage.put('/updateUser', async (req, res) => {
    try{
        const update = await User.updateOne({id: req.body.id}, {$set: req.body})
        await createLog('200',req.method,req.originalUrl,res.body,'updateUser Successfully!')
        res.status(200).json(update)
    }catch (e) {
        await createLog('500',req.method,req.originalUrl,res.body,e.message)
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = UserManage
