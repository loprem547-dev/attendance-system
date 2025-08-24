const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// สร้าง connection pool แทน connection เดี่ยว
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'atts',
    database: process.env.DB_NAME || 'student_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// ฟังก์ชันเชื่อมต่อฐานข้อมูล
function connectDatabase() {
    return new Promise((resolve, reject) => {
        // ตรวจสอบการเชื่อมต่อ
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err.message);
                console.error('🔧 ตรวจสอบการตั้งค่าดังนี้:');
                console.error('   - MySQL Server ทำงานอยู่หรือไม่');
                console.error('   - Host: ' + (process.env.DB_HOST || 'localhost'));
                console.error('   - Port: ' + (process.env.DB_PORT || 3306));
                console.error('   - User: ' + (process.env.DB_USER || 'root'));
                console.error('   - Database: ' + (process.env.DB_NAME || 'student_db'));
                reject(err);
            } else {
                console.log('✅ เชื่อมต่อฐานข้อมูล MySQL สำเร็จ!');
                console.log('📊 Database: ' + (process.env.DB_NAME || 'student_db'));
                connection.release();
                resolve();
            }
        });
    });
}

// ฟังก์ชันดึงข้อมูลนักเรียนทั้งหมด
async function getAllStudents() {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY student_id');
    return rows;
}

// ฟังก์ชันดึงข้อมูลนักเรียนตามห้องเรียน
async function getStudentsByClassroom(classroom) {
    const [rows] = await pool.query('SELECT * FROM students WHERE classroom = ? ORDER BY student_id', [classroom]);
    return rows;
}

// ฟังก์ชันดึงข้อมูลการเข้าเรียน
async function getAttendanceData() {
    const [rows] = await pool.query(`
        SELECT 
            a.id,
            a.student_id,
            s.name as student_name,
            s.classroom,
            a.date,
            a.time_slot,
            a.status,
            a.created_at
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        ORDER BY a.date DESC, a.time_slot
    `);
    return rows;
}

// ฟังก์ชันดึงข้อมูลช่วงเวลา
async function getTimeSlots() {
    const [rows] = await pool.query('SELECT * FROM time_slots ORDER BY start_time');
    return rows;
}

// ฟังก์ชันดึงข้อมูลผู้ใช้
async function getUsers() {
    const [rows] = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY username');
    return rows;
}

// ฟังก์ชันเพิ่มข้อมูลการเข้าเรียน
async function addAttendance(studentId, date, timeSlot, status, createdBy = 'admin') {
    const [result] = await pool.query(
        'INSERT INTO attendance (student_id, date, time_slot, status, created_by) VALUES (?, ?, ?, ?, ?)',
        [studentId, date, timeSlot, status, createdBy]
    );
    return result;
}

// ฟังก์ชันตรวจสอบการเข้าเรียน
async function checkAttendanceExists(studentId, date, timeSlot) {
    const [rows] = await pool.query(
        'SELECT * FROM attendance WHERE student_id = ? AND date = ? AND time_slot = ?',
        [studentId, date, timeSlot]
    );
    return rows.length > 0;
}

// ฟังก์ชันลบข้อมูลการเข้าเรียน
async function deleteAttendance(id) {
    const [result] = await pool.query('DELETE FROM attendance WHERE id = ?', [id]);
    return result;
}

// ฟังก์ชันเพิ่มช่วงเวลาใหม่
async function addTimeSlot(startTime, endTime, description) {
    const [result] = await pool.query(
        'INSERT INTO time_slots (start_time, end_time, description) VALUES (?, ?, ?)',
        [startTime, endTime, description]
    );
    return result;
}

// ฟังก์ชันลบช่วงเวลา
async function deleteTimeSlot(id) {
    const [result] = await pool.query('DELETE FROM time_slots WHERE id = ?', [id]);
    return result;
}

// ฟังก์ชันอัพเดทสถานะนักเรียน
async function updateStudentStatus(studentId, status, classroom) {
    const [result] = await pool.query(
        'UPDATE students SET status = ? WHERE student_id = ? AND classroom = ?',
        [status, studentId, classroom]
    );
    return result;
}

// ฟังก์ชันสมัครสมาชิกใหม่
function registerUser(username, password, displayName, email, tel, role) {
    return new Promise(async (resolve, reject) => {
        try {
            // เข้ารหัสรหัสผ่าน
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // ตรวจสอบว่ามี username นี้อยู่แล้วหรือไม่
            const checkQuery = 'SELECT id FROM users WHERE username = ?';
            pool.query(checkQuery, [username], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (results.length > 0) {
                    reject(new Error('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว'));
                    return;
                }
                
                // เพิ่มผู้ใช้ใหม่
                const insertQuery = `
                    INSERT INTO users (username, password, display_name, email, tel, role) 
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                
                pool.query(insertQuery, [username, hashedPassword, displayName, email, tel, role], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ success: true, userId: result.insertId });
                    }
                });
            });
        } catch (error) {
            reject(error);
        }
    });
}

// อัปเดตฟังก์ชัน checkUser ให้ใช้ bcrypt
function checkUser(username, password) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        pool.query(query, [username], async (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length === 0) {
                resolve(null);
            } else {
                const user = results[0];
                try {
                    // ตรวจสอบรหัสผ่านด้วย bcrypt
                    const isValidPassword = await bcrypt.compare(password, user.password);
                    if (isValidPassword) {
                        resolve(user);
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}

// ฟังก์ชันดึงสถิติการเข้าเรียนของนักเรียนแต่ละคนในช่วงวันที่
async function getAttendanceStatistics(classroom, startDate, endDate) {
    const [rows] = await pool.query(`
        SELECT 
            s.student_id,
            s.name as student_name,
            s.classroom,
            SUM(a.status = 'present') as present,
            SUM(a.status = 'absent') as absent,
            SUM(a.status = 'sick') as sick,
            SUM(a.status = 'activity') as activity,
            SUM(a.status = 'home') as home
        FROM students s
        LEFT JOIN attendance a ON s.student_id = a.student_id
            AND a.date BETWEEN ? AND ?
        WHERE s.classroom = ?
        GROUP BY s.student_id, s.name, s.classroom
        ORDER BY s.student_id
    `, [startDate, endDate, classroom]);
    return rows;
}

// -- ฟังก์ชันเพิ่มเติมตามที่ขอ --

// ดึงข้อมูลชั้นเรียนทั้งหมด
async function getClassrooms() {
    const [rows] = await pool.query('SELECT * FROM classrooms ORDER BY classroom_name');
    return rows;
}

// ดึงข้อมูลการเข้าเรียนตามวันที่, ช่วงเวลา และห้องเรียน
async function getAttendanceByDateTimeSlotAndClassroom(date, timeSlot, classroom) {
    const [rows] = await pool.query(`
        SELECT a.*, s.name as student_name, s.classroom
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE a.date = ? AND a.time_slot = ? AND s.classroom = ?
        ORDER BY a.student_id
    `, [date, timeSlot, classroom]);
    return rows;
}

// ดึงข้อมูลการเข้าเรียนตามวันที่และช่วงเวลา
async function getAttendanceByDateAndTimeSlot(date, timeSlot) {
    const [rows] = await pool.query(`
        SELECT a.*, s.name as student_name, s.classroom
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE a.date = ? AND a.time_slot = ?
        ORDER BY s.classroom, a.student_id
    `, [date, timeSlot]);
    return rows;
}

// ดึงข้อมูลการเข้าเรียนตามวันที่และห้องเรียน
async function getAttendanceByDateAndClassroom(date, classroom) {
    const [rows] = await pool.query(`
        SELECT a.*, s.name as student_name, s.classroom
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE a.date = ? AND s.classroom = ?
        ORDER BY a.time_slot, a.student_id
    `, [date, classroom]);
    return rows;
}

// ดึงข้อมูลการเข้าเรียนตามวันที่
async function getAttendanceByDate(date) {
    const [rows] = await pool.query(`
        SELECT a.*, s.name as student_name, s.classroom
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE a.date = ?
        ORDER BY s.classroom, a.time_slot, a.student_id
    `, [date]);
    return rows;
}

// ลบข้อมูลการเข้าเรียนตามวันที่, ช่วงเวลา และ (ถ้ามี) ห้องเรียน
async function clearAttendanceByDateAndTimeSlot(date, timeSlot, classroom) {
    let query = 'DELETE a FROM attendance a JOIN students s ON a.student_id = s.student_id WHERE a.date = ? AND a.time_slot = ?';
    const params = [date, timeSlot];

    if (classroom) {
        query += ' AND s.classroom = ?';
        params.push(classroom);
    }

    const [result] = await pool.query(query, params);
    return result;
}

// ลบข้อมูลการเข้าเรียนทั้งหมด
async function clearAllAttendance() {
    const [result] = await pool.query('DELETE FROM attendance');
    return result;
}

module.exports = {
    connectDatabase,
    getAllStudents,
    getStudentsByClassroom,
    getAttendanceData,
    getTimeSlots,
    getUsers,
    addAttendance,
    checkAttendanceExists,
    deleteAttendance,
    addTimeSlot,
    deleteTimeSlot,
    updateStudentStatus,
    checkUser,
    registerUser,
    getAttendanceStatistics,

    // export ฟังก์ชันใหม่
    getClassrooms,
    getAttendanceByDateTimeSlotAndClassroom,
    getAttendanceByDateAndTimeSlot,
    getAttendanceByDateAndClassroom,
    getAttendanceByDate,
    clearAttendanceByDateAndTimeSlot,
    clearAllAttendance,
};
