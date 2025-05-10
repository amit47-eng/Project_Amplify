const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const auth = require('../middlewares/auth');
const logger = require('../config/logger');

// Get all songs by mood
router.get('/mood/:mood', async (req, res) => {
  try {
    const songs = await Song.find({ mood: req.params.mood })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(songs);
  } catch (error) {
    logger.error('Error fetching songs by mood:', error);
    res.status(500).json({ message: 'Error fetching songs' });
  }
});

// Get song by ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    logger.error('Error fetching song:', error);
    res.status(500).json({ message: 'Error fetching song' });
  }
});

// Search songs
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const regex = new RegExp(query, 'i');
    const songs = await Song.find({
      $or: [
        { title: regex },
        { artist: regex },
        { album: regex }
      ]
    }).limit(20);
    res.json(songs);
  } catch (error) {
    logger.error('Error searching songs:', error);
    res.status(500).json({ message: 'Error searching songs' });
  }
});

// Add a new song
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      mood,
      duration,
      thumbnail,
      audioUrl
    } = req.body;

    const song = new Song({
      title,
      artist,
      album,
      mood,
      duration,
      thumbnail,
      audioUrl
    });

    await song.save();
    res.status(201).json(song);
  } catch (error) {
    logger.error('Error adding song:', error);
    res.status(500).json({ message: 'Error adding song' });
  }
});

module.exports = router;
