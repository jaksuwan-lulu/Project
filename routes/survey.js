const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Survey = require('../models/SurveyResponse');

// 👉 POST: รับข้อมูลจาก Dialogflow แล้วบันทึกลง MongoDB
router.post('/', async (req, res) => {
  try {
    const { userId, scores } = req.body;

    // ✅ ตรวจสอบความครบถ้วน
    if (!userId || !Array.isArray(scores) || scores.length !== 20) {
      return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบหรือคะแนนไม่ครบ 20 ข้อ" });
    }

    const totalScore = scores.reduce((a, b) => a + b, 0);

    let level = "";
    if (totalScore <= 20) level = "ความเครียดระดับ 1";
    else if (totalScore <= 40) level = "ความเครียดระดับ 2";
    else if (totalScore <= 60) level = "ความเครียดระดับ 3";
    else level = "ความเครียดระดับ 4";

    const newSurvey = new Survey({
      ScoreID: uuidv4(),
      UserID: userId,
      scores,
      totalScore,
      stressLevel: level,
      timestamp: new Date(), // ✅ เพิ่ม timestamp
    });

    await newSurvey.save();
    res.json({ success: true, totalScore, stressLevel: level });

  } catch (err) {
    console.error("❌ บันทึกแบบสอบถามล้มเหลว:", err);
    res.status(500).json({ success: false, message: "เซิร์ฟเวอร์มีปัญหา" });
  }
});

// 👉 GET: Pie Chart Summary
router.get('/summary', async (req, res) => {
  try {
    const all = await Survey.find({});
    const result = {
      "ความเครียดระดับ 1": 0,
      "ความเครียดระดับ 2": 0,
      "ความเครียดระดับ 3": 0,
      "ความเครียดระดับ 4": 0,
    };
    all.forEach(r => result[r.stressLevel]++);
    const output = Object.entries(result).map(([stressLevel, count]) => ({ stressLevel, count }));
    res.json(output);
  } catch (err) {
    res.status(500).json({ message: "ดึงข้อมูลสรุปไม่สำเร็จ" });
  }
});

// 👉 GET: ข้อมูลทั้งหมดของ userId (ใช้แสดงใน dashboard)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const surveys = await Survey.find({ UserID: userId }).sort({ timestamp: -1 });

    if (!surveys.length) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลของผู้ใช้คนนี้' });
    }

    res.json({ success: true, data: surveys });
  } catch (err) {
    console.error("❌ ดึงข้อมูลทั้งหมดล้มเหลว:", err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// 👉 GET: ผลล่าสุดของผู้ใช้
router.get('/latest/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const latest = await Survey.findOne({ UserID: userId }).sort({ timestamp: -1 });
    if (!latest) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลล่าสุด" });
    res.json({ success: true, data: latest });
  } catch (err) {
    console.error("❌ ดึงข้อมูลล่าสุดล้มเหลว:", err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลล่าสุด' });
  }
});

// 👉 GET: ประวัติทั้งหมดของผู้ใช้
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await Survey.find({ UserID: userId }).sort({ timestamp: -1 });
    res.json({ success: true, data: history });
  } catch (err) {
    console.error("❌ ดึงประวัติล้มเหลว:", err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการโหลดประวัติ' });
  }
});

module.exports = router;
