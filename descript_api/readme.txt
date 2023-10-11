req.body = newStore {
    {
        "taxId":"123456789",
        "tel":"0892554789",
        "route":"R01" ,
        "type": "1",
        "addressTitle":"test" ,
        "distric":"test" ,
        "subDistric":"test" ,
        "province":"test" ,
        "provinceCode":"44" ,
        "postCode ":"44150",
        "zone":"BE191" ,
        "latitude":"111.002354" ,
        "longtitude":"52.00112255" ,
        "lineId":"@test" ,
        "policyConsent":[
            {
                "status":"Agree",
                "date":"2023-10-10"
            }
        ] ,
        "imageList":[
            {
                "id":1,
                "name":"left.png",
                "path":"to/path",
                "descript":""
            },
            {
                "id":2,
                "name":"right.png",
                "path":"to/path",
                "descript":""
            }
        ] ,
        "note ":""
    }
}


req.body = addSeries [
    {
        // "id":1,
        "type":"test",
        "zone":"ทดสอบ",
        "detail":{
            "start":1,
            "end":10000,
            "available":1
        },
        "descript":"ใช้เพื่อทดสอบ"
    }
]

req.body = addTypeStore [
    {
        "name":"มินิมาร์ท",
        "descript":"ประเภทร้านค้า ที่มีลักษณะเป็นร้าน"
    }
]



// des status
newStore : 0=ไม่อนุมัติ ,1=รออนุมัติ ,2=อนุมัติ
status open/close : 0=ไม่เปิดใช้งาน ,1=เปิดใช้งาน