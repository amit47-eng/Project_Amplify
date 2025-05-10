const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const logger = require('../config/logger');

// Get all moods
router.get('/', async (req, res) => {
  try {
    const moods = [
      'happy',
      'sad',
      'energetic',
      'calm',
      'romantic',
      'angry',
      'chill'
    ];
    res.json(moods);
  } catch (error) {
    logger.error('Error fetching moods:', error);
    res.status(500).json({ message: 'Error fetching moods' });
  }
});

// Get songs by mood
router.get('/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    const songs = await Song.find({ mood: mood.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(songs);
  } catch (error) {
    logger.error('Error fetching songs by mood:', error);
    res.status(500).json({ message: 'Error fetching songs' });
  }
});

module.exports = router;
