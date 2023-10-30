const express = require('express')
require('../../configs/connect')
const UserManage = express.Router()
const {User} = require('../../models/user')

UserManage.post('/getAll', async (req, res) => {
    const data = await User.find({},{_id:0,__v:0})
    res.status(200).json(data)
})

UserManage.post('/getDetail', async (req, res) => {
    const data = await User.findOne({id:req.body.id},{_id:0,__v:0})
    res.status(200).json(data)
})

UserManage.post('/addUser', async (req, res) => {
    const newUser = new User(req.body)
    await newUser.save()
    res.status(200).json(newUser)
})

UserManage.post('/changePassword', async (req, res) => {
    const update = await User.updateOne({id: req.body.id}, {$set: {passWord: req.body.newPassWord}})
    res.status(200).json(update)
})

UserManage.put('/updateUser', async (req, res) => {
    const update = await User.updateOne({id: req.body.id}, {$set: req.body})
    res.status(200).json(update)
})

module.exports = UserManage
