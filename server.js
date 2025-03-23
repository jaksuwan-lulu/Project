require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const surveyRoutes = require('./routes/survey');
const dialogflowWebhook = require('./webhook/dialogflow');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: '*', // 🔥 เปลี่ยนเป็น URL จริงของ frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());

// ✅ Serve frontend (static HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Backend API routes
app.use('/api/auth', authRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/webhook/dialogflow', dialogflowWebhook);

// ✅ สำหรับเปิดไฟล์ HTML เท่านั้น
app.get('/*.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path));
});

// ✅ fallback route สำหรับ React SPA หรืออื่น ๆ
// ถ้าไม่ใช้ React SPA สามารถลบอันนี้ออกได้
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index.html'));
// });

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
