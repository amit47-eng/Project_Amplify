const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Song = require('../models/Song');
const auth = require('../middlewares/auth');
const logger = require('../config/logger');

// Add song to favorites
router.post('/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    if (!user.favoriteSongs.includes(songId)) {
      user.favoriteSongs.push(songId);
      await user.save();
    }

    res.json(user);
  } catch (error) {
    logger.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

// Remove song from favorites
router.delete('/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favoriteSongs = user.favoriteSongs.filter(
      (id) => id.toString() !== songId
    );
    await user.save();

    res.json(user);
  } catch (error) {
    logger.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
});

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('favoriteSongs')
      .select('favoriteSongs');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favoriteSongs);
  } catch (error) {
    logger.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

module.exports = router;
