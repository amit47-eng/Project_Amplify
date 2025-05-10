const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const auth = require('../middlewares/auth');
const logger = require('../config/logger');

// Create new playlist
router.post('/', auth, async (req, res) => {
  try {
    const { name, mood } = req.body;
    const playlist = new Playlist({
      name,
      mood,
      owner: req.user.userId
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    logger.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Error creating playlist' });
  }
});

// Get user's playlists
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.userId })
      .populate('songs')
      .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    logger.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Error fetching playlists' });
  }
});

// Add song to playlist
router.post('/:playlistId/songs/:songId', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.playlistId,
      owner: req.user.userId
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const song = await Song.findById(req.params.songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    if (!playlist.songs.includes(song._id)) {
      playlist.songs.push(song._id);
      await playlist.save();
    }

    res.json(playlist);
  } catch (error) {
    logger.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Error adding song to playlist' });
  }
});

// Remove song from playlist
router.delete('/:playlistId/songs/:songId', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.playlistId,
      owner: req.user.userId
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter(
      songId => songId.toString() !== req.params.songId
    );
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    logger.error('Error removing song from playlist:', error);
    res.status(500).json({ message: 'Error removing song from playlist' });
  }
});

module.exports = router;
