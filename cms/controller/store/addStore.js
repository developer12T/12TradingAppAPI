const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('../../configs/connect')
const addStore = express.Router()
const { Store } = require('../../models/store')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

addStore.post('/newStore', upload.single('picture'),async(req, res) => {
    const { currentdatena,currentdateDash } = require('../../utils/utility.js')
    try {

        // เพิ่มรูปภาพ
        // const image = req.file
        // const imageName = 'รหัสร้าน_' + currentdatena() + path.extname(image.originalname)
        // const imagePath = path.join(__dirname, '../../public/image/store', imageName)
        // fs.writeFileSync(imagePath, image.buffer)
        // สิ้นสุด
        
        const id_count = await Store.findOne().sort({ idNumber: -1 }).exec()
        if(id_count === null){
            var idIncret = 1
        }else{
            var idIncret = id_count.idNumber + 1
        }

        const { taxId ,name,tel ,route ,type ,addressTitle ,distric ,subDistric ,province ,provinceCode ,postCode ,zone ,latitude ,longtitude ,lineId ,approvePerson ,policyConsent ,imageList ,note } = req.body

        const approveData = {
            status:"1",
             dateSend:currentdateDash(),
            dateAction:"",
            appPerson: approvePerson
        }
        const mainData = { idCharecter:'MBE',idNumber:idIncret, taxId,name,tel,route,type,addressTitle,distric,subDistric,province,provinceCode,postCode,zone,latitude,longtitude,lineId,approve: approveData,status:"0", policyConsent,imageList,note }
        console.log(mainData)
        const newStore = new Store(mainData)
        await newStore.save()
        
        res.status(200).json({ message: 'Store added successfully',id_count:idIncret})
        // res.status(200).json({ message: 'Store added successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    } 
})
 
module.exports = addStore

