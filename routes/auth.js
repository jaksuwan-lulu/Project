// app/routes/auth.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ✅ สมัครสมาชิก
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false, message: '⚠️ Username นี้ถูกใช้ไปแล้ว' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      UserID: uuidv4(),
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ success: true, message: '✅ สมัครสมาชิกสำเร็จ', userId: newUser.UserID });

  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: '❌ เกิดข้อผิดพลาดในระบบ' });
  }
});

// ✅ เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(401).json({ success: false, message: '❌ ไม่พบชื่อผู้ใช้นี้' });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '❌ รหัสผ่านไม่ถูกต้อง' });
    }

    res.status(200).json({
      success: true,
      message: '✅ เข้าสู่ระบบสำเร็จ',
      userId: foundUser.UserID,
      username: foundUser.username
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: '❌ ระบบมีปัญหา กรุณาลองใหม่' });
  }
});

// ✅ เปลี่ยนชื่อผู้ใช้
router.put('/update-username', async (req, res) => {
  const { userId, newUsername } = req.body;

  try {
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(409).json({ success: false, message: '⚠️ Username นี้มีผู้ใช้แล้ว' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { UserID: userId },
      { username: newUsername },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: '❌ ไม่พบผู้ใช้นี้' });
    }

    res.status(200).json({ success: true, message: '✅ เปลี่ยนชื่อผู้ใช้สำเร็จ', username: updatedUser.username });

  } catch (err) {
    console.error("❌ Update username error:", err);
    res.status(500).json({ success: false, message: '❌ เกิดข้อผิดพลาดในการเปลี่ยนชื่อผู้ใช้' });
  }
});

// ✅ เปลี่ยนรหัสผ่าน
// 🔁 PUT /api/auth/change-password
router.put('/change-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '❌ กรุณากรอกข้อมูลให้ครบ' });
    }

    const foundUser = await User.findOne({ UserID: userId });
    if (!foundUser) {
      return res.status(404).json({ success: false, message: '❌ ไม่พบผู้ใช้' });
    }

    const isMatch = await bcrypt.compare(oldPassword, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '❌ รหัสผ่านเดิมไม่ถูกต้อง' });
    }

    const hashedNew = bcrypt.hashSync(newPassword, 10);
    foundUser.password = hashedNew;
    await foundUser.save();

    res.json({ success: true, message: '✅ เปลี่ยนรหัสผ่านเรียบร้อย' });

  } catch (error) {
    console.error("❌ Change password error:", error);
    res.status(500).json({ success: false, message: '❌ ระบบผิดพลาด กรุณาลองใหม่' });
  }
});


module.exports = router;
