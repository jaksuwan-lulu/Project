# Rimberio Mental Health Web App

ระบบประเมินความเครียดของผู้ใช้งาน พร้อมแสดงผลและประวัติผ่าน Dashboard  
Frontend เป็น HTML + Tailwind CSS และ Dialogflow  
Backend เชื่อมต่อกับ MongoDB ผ่าน Node.js (Express + Mongoose)

---

## ✅ ขั้นตอนการติดตั้งและใช้งาน (สำหรับเครื่องใหม่)

### 1️⃣ ติดตั้ง Node.js และ npm
ดาวน์โหลดได้จาก [https://nodejs.org/](https://nodejs.org/)  
เมื่อติดตั้งเสร็จ ตรวจสอบด้วยคำสั่ง:

```bash
node -v
npm -v


### 2️⃣ เปิด Command Line ที่โปรเจกต์ (C:\...\rimberio-project) แล้วติดตั้ง dependencies หลัก: npm install express mongoose cors body-parser uuid bcrypt dotenv


### 3️⃣ ติดตั้งเครื่องมือเพิ่มเติม npm install -g ngrok


### ✅ เริ่มเซิร์ฟเวอร์ cd app >> node server.js  >> http://localhost:5000


### เปิดอีก Terminal รัน ngrok http 5000


### คัดลอกลิ้งค์ https://abc123.ngrok-free.app(ตัวอย่าง)


