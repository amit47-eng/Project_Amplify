import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const moods = [
  { name: 'Happy', color: '#FFD700' },
  { name: 'Sad', color: '#87CEEB' },
  { name: 'Energetic', color: '#FF69B4' },
  { name: 'Calm', color: '#98FB98' },
  { name: 'Romantic', color: '#FFB6C1' },
  { name: 'Angry', color: '#FF4500' },
  { name: 'Chill', color: '#ADD8E6' },
];

const MoodSelector = ({ onSelect, selectedMood }) => {
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 4,
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Select Your Mood
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Grid container spacing={3}>
            {moods.map((mood) => (
              <Grid item xs={12} sm={6} md={4} key={mood.name}>
                <motion.div variants={itemVariants}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: mood.color,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        transition: 'transform 0.2s ease-in-out',
                      },
                    }}
                    onClick={() => onSelect(mood.name.toLowerCase())}
                  >
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                      {mood.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Discover music that matches your mood
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    </Paper>
  );
};

export default MoodSelector;
