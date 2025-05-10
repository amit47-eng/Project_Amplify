const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    required: true,
    trim: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'energetic', 'calm', 'romantic', 'angry', 'chill']
  },
  duration: {
    type: Number,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Song', songSchema);
