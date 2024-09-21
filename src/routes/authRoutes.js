const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'Auth route placeholder' });
});

// Test route
router.get('/test', async (req, res) => {
  try {
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await TestModel.create({ name: 'test document' });
    const docs = await TestModel.find();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

module.exports = router;