import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const moods = [
  {
    name: 'Happy',
    color: '#FFD700',
    description: 'Uplifting and cheerful songs to brighten your day',
  },
  {
    name: 'Sad',
    color: '#87CEEB',
    description: 'Melancholic tracks for reflective moments',
  },
  {
    name: 'Energetic',
    color: '#FF69B4',
    description: 'High-energy music to keep you motivated',
  },
  {
    name: 'Calm',
    color: '#98FB98',
    description: 'Relaxing tunes for peace and tranquility',
  },
  {
    name: 'Romantic',
    color: '#FFB6C1',
    description: 'Love songs to set the mood',
  },
  {
    name: 'Angry',
    color: '#FF4500',
    description: 'Intense music for when you need to let it out',
  },
  {
    name: 'Chill',
    color: '#ADD8E6',
    description: 'Smooth tracks for a laid-back vibe',
  },
];

const MoodCard = ({ mood, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 2,
          backgroundColor: mood.color,
          color: theme.palette.getContrastText(mood.color),
          cursor: 'pointer',
          height: isMobile ? '150px' : '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        onClick={onClick}
      >
        <Typography variant="h5" component="h2">
          {mood.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {mood.description}
        </Typography>
      </Paper>
    </motion.div>
  );
};

const Moods = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleMoodClick = (mood) => {
    navigate('/dashboard', { state: { mood: mood.name.toLowerCase() } });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Choose Your Mood
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        Select a mood to discover music that matches your current state
      </Typography>

      <Grid container spacing={3}>
        {moods.map((mood) => (
          <Grid item xs={12} sm={6} md={4} key={mood.name}>
            <MoodCard mood={mood} onClick={() => handleMoodClick(mood)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Moods;
