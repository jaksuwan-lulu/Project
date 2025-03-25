const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Survey = require('../models/SurveyResponse');

// ✅ ตรวจสอบระบบ
router.get('/status', (req, res) => {
  res.json({
    service: "Dialogflow Webhook",
    status: "✅ Connected",
    time: new Date().toISOString()
  });
});

// ✅ Webhook Dialogflow
router.post('/', async (req, res) => {
  try {
    const intent = req.body.queryResult.intent.displayName;

    if (intent === 'CheckConnection') {
      return res.json({
        fulfillmentText: '✅ ระบบเชื่อมต่อกับ Dialogflow เรียบร้อยแล้ว!'
      });
    }

    // ✅ ดึง userId จาก session หรือจาก custom payload
    const fallbackUserId = req.body.session?.split('/').pop();
    const customUserId = req.body.originalDetectIntentRequest?.payload?.userId || null;
    const userId = customUserId || fallbackUserId;

    // ✅ ดึง context ที่มีคะแนนทั้งหมด
    const contexts = req.body.queryResult.outputContexts || [];
    const scores = Array(20).fill(null);

    for (const context of contexts) {
      const params = context.parameters || {};
      for (let i = 1; i <= 20; i++) {
        const key = `score${i}`;
        if (params[key] !== undefined && params[key] !== null) {
          scores[i - 1] = Number(params[key]);
        }
      }
    }

    // ✅ ตรวจสอบว่าคะแนนครบทั้ง 20 ข้อหรือยัง
    if (scores.includes(null)) {
      return res.json({
        fulfillmentText: "❗ กรุณาตอบคำถามให้ครบทั้ง 20 ข้อก่อน"
      });
    }

    // ✅ คำนวณคะแนนรวม และระดับความเครียด
    const totalScore = scores.reduce((a, b) => a + b, 0);
    let stressLevel = "";
    if (totalScore <= 23) stressLevel = "ความเครียดระดับ 1";
    else if (totalScore <= 41) stressLevel = "ความเครียดระดับ 2";
    else if (totalScore <= 61) stressLevel = "ความเครียดระดับ 3";
    else stressLevel = "ความเครียดระดับ 4";

    // ✅ บันทึกลง MongoDB
    const newSurvey = new Survey({
      ScoreID: uuidv4(),
      UserID: userId || null,
      scores,
      totalScore,
      stressLevel,
      timestamp: new Date()
    });

    await newSurvey.save();

    return res.json({
      fulfillmentText: `✅ แบบสอบถามเสร็จสิ้นแล้ว\nคะแนนรวมของคุณคือ ${totalScore} (${stressLevel})`
    });

  } catch (error) {
    console.error("❌ Error in Dialogflow Webhook:", error);
    return res.json({
      fulfillmentText: "❌ เกิดข้อผิดพลาดขณะบันทึกผล กรุณาลองใหม่อีกครั้ง"
    });
  }
});

module.exports = router;
