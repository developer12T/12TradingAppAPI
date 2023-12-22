const express = require('express')
require('../../configs/connect')
const {Promotion} = require("../../models/promotion");
const addPromotion = express.Router()
addPromotion.post('/addPromotion', async (req, res) => {
    try {
        const idIn = await Promotion.findOne({},{proId:1,_id:0}).sort({proId:-1})
        if(!idIn){
            var idAuto = 'pro01'

        }else{
            var idAutoPre = parseInt(idIn.proId.substring(3))+1
            if(idAutoPre > 9){
                var idAuto = 'pro'+idAutoPre
            }else{
                var idAuto = 'pro0'+idAutoPre
            }
        }
        req.body.proId = idAuto
        const data = await Promotion.create(req.body)
        res.status(200).json({
            status: 201,
            message: 'AddPromotion Successfully'
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: 500,
            message: e.message
        })
    }
})

module.exports = addPromotion