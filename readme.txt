configs สำหรับไฟล์ config ต่างๆ
controllers สำหรับควบคุมการทำงานของการร้องขอ
utils สำหรับฟังก์ชั่นที่ใช้ร่วมกัน (common)
public สำหรับเก็บไฟล์ หรือรูปภาพ
routes สำหรับกำหนด เส้นทางการร้องขอ (Request)
services สำหรับตรรกะ การคำนวณ ต่างๆ (Logic)

status http{
    500 = Internal overall
    501 = !req.body
    507 = Validation fail

    200 = complete
}