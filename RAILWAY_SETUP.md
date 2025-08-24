# 🚀 คู่มือการตั้งค่า Railway สำหรับระบบเช็คชื่อนักเรียน

## 📋 **ขั้นตอนการ Deploy บน Railway**

### **1. สร้าง Project ใหม่**
1. ไปที่ [Railway.app](https://railway.app)
2. สมัครสมาชิกด้วย GitHub account
3. กด "New Project" > "Deploy from GitHub repo"
4. เลือก repository `loprem547-dev/attendance-system`

### **2. สร้าง MySQL Database**
1. ใน Railway dashboard กด "New" > "Database" > "MySQL"
2. รอให้ MySQL database สร้างเสร็จ
3. คัดลอก Connection String

### **3. ตั้งค่า Environment Variables**
ใน Railway dashboard ตั้งค่าต่อไปนี้:

#### **Database Configuration:**
```
DB_HOST=your_mysql_host_from_railway
DB_USER=your_mysql_username_from_railway
DB_PASSWORD=your_mysql_password_from_railway
DB_NAME=your_database_name_from_railway
DB_PORT=3306
```

#### **ตัวอย่าง:**
```
DB_HOST=containers-us-west-123.railway.app
DB_USER=root
DB_PASSWORD=HZzcsKocblZEYqkeQxjKfsfJYnlgnKSm
DB_NAME=railway
DB_PORT=47811
```

### **4. Import ฐานข้อมูล**
1. ไปที่ MySQL database ใน Railway
2. กด "Connect" หรือ "Open in MySQL Workbench"
3. เลือก "Import" หรือ "Execute SQL"
4. อัปโหลดไฟล์ `student_db_backup.sql`
5. รัน SQL script

### **5. อัปเดตตาราง users**
หลังจาก import ฐานข้อมูลแล้ว:
1. รันไฟล์ `update_users_table.sql`
2. ตรวจสอบว่าคอลัมน์ `email` และ `tel` ถูกเพิ่มแล้ว

## 🔧 **การแก้ไขปัญหา**

### **ปัญหา: Cannot find module 'bcrypt'**
**วิธีแก้:** Railway จะติดตั้ง dependencies อัตโนมัติ ถ้ายังมีปัญหาให้:
1. ตรวจสอบ package.json ว่ามี bcrypt
2. รอให้ Railway auto-deploy เสร็จ
3. ตรวจสอบ logs ว่าติดตั้ง dependencies สำเร็จ

### **ปัญหา: connect ECONNREFUSED ::1:3306**
**วิธีแก้:** ตั้งค่า Environment Variables ไม่ถูกต้อง
1. ตรวจสอบ DB_HOST ว่าตั้งค่าถูกต้อง
2. ตรวจสอบ DB_PORT ว่าตั้งค่าถูกต้อง
3. ตรวจสอบ Connection String จาก Railway

### **ปัญหา: Access denied for user**
**วิธีแก้:** ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง
1. ตรวจสอบ DB_USER และ DB_PASSWORD
2. ตรวจสอบว่า MySQL user มีสิทธิ์เข้าถึง database

## 📊 **ตรวจสอบการทำงาน**

### **1. ตรวจสอบ Logs**
ใน Railway dashboard:
1. ไปที่ "Deployments" tab
2. กด "View Logs"
3. ตรวจสอบว่ามีข้อความ "✅ เชื่อมต่อฐานข้อมูล MySQL สำเร็จ!"

### **2. ตรวจสอบ API**
หลังจาก deploy สำเร็จ:
- ตรวจสอบสถานะ: `{URL}/api/health`
- หน้า Login: `{URL}/`
- หน้า Register: `{URL}/register`

### **3. ตรวจสอบฐานข้อมูล**
1. ไปที่ MySQL database ใน Railway
2. ตรวจสอบว่ามีตาราง:
   - `users`
   - `students`
   - `attendance`
   - `time_slots`

## 🎯 **ข้อมูลสำหรับทดสอบ**

### **ผู้ใช้ที่มีอยู่แล้ว:**
- **admin** / admin123 (ผู้ดูแลระบบ)
- **teacher1** / teach123 (ครู)
- **teacher2** / teach456 (ครู)
- **commu** / attscommu (แผนกวิชาสื่อสาร)

### **ข้อมูลนักเรียน:**
- นักเรียนชั้นปี 1 และ 2
- รวม 101 คน
- แบ่งตามตอนเรียนต่างๆ

## 📞 **การติดต่อ**

หากมีปัญหาในการตั้งค่า:
1. ตรวจสอบ logs ใน Railway dashboard
2. ตรวจสอบ Environment Variables
3. ตรวจสอบการเชื่อมต่อฐานข้อมูล

## 🚀 **หลังจากตั้งค่าเสร็จ**

ระบบจะพร้อมใช้งานที่:
- **URL:** ที่ Railway ให้
- **Database:** MySQL บน Railway
- **Features:** ระบบเช็คชื่อนักเรียนครบถ้วน
- **Registration:** ระบบสมัครสมาชิกใหม่ 