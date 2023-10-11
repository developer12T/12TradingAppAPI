const express = require('express')
require('../../configs/connect')
const newStore = express.Router()
const { Store } = require('../../models/store')

newStore.put('/newStore', async(req, res) => {
    const { currentdateDash } = require('../../utils/utility.js')
    try {
        if(req.body.id !== undefined && req.body.id !== ''){
            if(req.body.appPerson !== undefined && req.body.appPerson !== ''){
                if(req.body.status !== undefined && req.body.status !== ''){
                    await Store.updateOne({idNumber:req.body.id}, { $set: { 'approve.status': req.body.status,'approve.dateAction':currentdateDash(),'approve.appPerson':req.body.appPerson,status:'1'} })
                    res.status(200).json({message:'Store approve/not approve complete!'})
                }else{
                    res.status(501).json({message:'require data!'})      
                } 
            }else{
                res.status(501).json({message:'require data!'})      
            }
        }else{
            res.status(501).json({message:'require data!'})       
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 
})

module.exports = newStore
