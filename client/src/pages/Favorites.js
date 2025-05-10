import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeSongFromFavorites } from '../store/slices/userSlice';
import { playTrack } from '../store/slices/playerSlice';
import { motion } from 'framer-motion';

const Favorites = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { currentTrack, isPlaying } = useSelector((state) => state.player);

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

  const handlePlaySong = (song) => {
    dispatch(playTrack(song));
  };

  const handleRemoveFromFavorites = async (songId) => {
    await dispatch(removeSongFromFavorites(songId));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
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
            <Typography variant="h4" component="h1" gutterBottom>
              Your Favorites
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              {user?.favoriteSongs?.length} songs
            </Typography>
          </Paper>

          <Box>
            <Typography variant="h5" gutterBottom>
              Liked Songs
            </Typography>
            <motion.div variants={containerVariants}>
              <List>
                {user?.favoriteSongs?.map((song) => (
                  <motion.div key={song._id} variants={itemVariants}>
                    <ListItem
                      button
                      onClick={() => handlePlaySong(song)}
                    >
                      <ListItemText
                        primary={song.title}
                        secondary={song.artist}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaySong(song);
                          }}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFavorites(song._id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Favorites;
