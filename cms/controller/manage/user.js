const express = require('express')
require('../../configs/connect')
const UserManage = express.Router()
const {User} = require('../../models/user')

UserManage.post('/getAll', async (req, res) => {
    try{
        const data = await User.find({},{_id:0,__v:0})
        res.status(200).json(data)
    }catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

UserManage.post('/getDetail', async (req, res) => {
    try{
        const data = await User.findOne({id:req.body.id},{_id:0,__v:0,passWord:0})
        res.status(200).json(data)
    }catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

UserManage.post('/addUser', async (req, res) => {
    try{
        const newUser = new User(req.body)
        await newUser.save()
        res.status(200).json(newUser)
    }catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

UserManage.post('/changePassword', async (req, res) => {
    try{
        const update = await User.updateOne({id: req.body.id}, {$set: {passWord: req.body.newPassWord}})
        res.status(200).json(update)
    }catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

UserManage.put('/updateUser', async (req, res) => {
    try{
        const update = await User.updateOne({id: req.body.id}, {$set: req.body})
        res.status(200).json(update)
    }catch (e) {
        res.status(500).json({
            status:500,
            message:e.message
        })
    }
})

module.exports = UserManage
