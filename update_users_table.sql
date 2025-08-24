-- อัปเดตตาราง users เพื่อเพิ่มคอลัมน์ email และ tel
-- รันคำสั่งนี้ในฐานข้อมูล MySQL บน Railway

USE student_db;

-- เพิ่มคอลัมน์ email และ tel ในตาราง users
ALTER TABLE users 
ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '' AFTER display_name,
ADD COLUMN tel VARCHAR(20) NOT NULL DEFAULT '' AFTER email;

-- อัปเดตข้อมูลผู้ใช้ที่มีอยู่แล้ว (ถ้ามี)
UPDATE users SET 
    email = 'admin@rtaf.mi.th',
    tel = '081-000-0001'
WHERE username = 'admin';

UPDATE users SET 
    email = 'teacher1@rtaf.mi.th',
    tel = '081-000-0002'
WHERE username = 'teacher1';

UPDATE users SET 
    email = 'teacher2@rtaf.mi.th',
    tel = '081-000-0003'
WHERE username = 'teacher2';

UPDATE users SET 
    email = 'commu@rtaf.mi.th',
    tel = '081-000-0004'
WHERE username = 'commu';

-- แสดงโครงสร้างตาราง users หลังจากอัปเดต
DESCRIBE users;

-- แสดงข้อมูลผู้ใช้ทั้งหมด
SELECT id, username, display_name, email, tel, role, created_at FROM users; 