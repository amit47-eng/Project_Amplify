import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  QueueMusic as QueueMusicIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeSongFromPlaylist,
  addSongToPlaylist,
} from '../store/slices/playlistSlice';
import { playTrack } from '../store/slices/playerSlice';
import { motion } from 'framer-motion';

const Playlist = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { playlists, loading } = useSelector((state) => state.playlist);
  const { currentTrack, isPlaying } = useSelector((state) => state.player);

  const [searchQuery, setSearchQuery] = useState('');
  const [availableSongs, setAvailableSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  const playlist = playlists.find((p) => p._id === id);

  useEffect(() => {
    // Fetch available songs that are not in this playlist
    fetch(`/api/songs/mood/${playlist?.mood}`)
      .then((res) => res.json())
      .then((data) => {
        // Filter out songs that are already in the playlist
        const filteredSongs = data.filter(
          (song) => !playlist?.songs?.includes(song._id)
        );
        setAvailableSongs(filteredSongs);
      });
  }, [playlist]);

  const handlePlaySong = (song) => {
    dispatch(playTrack(song));
  };

  const handleAddSong = async (songId) => {
    await dispatch(addSongToPlaylist({ playlistId: id, songId }));
    // Refresh available songs list
    fetch(`/api/songs/mood/${playlist?.mood}`)
      .then((res) => res.json())
      .then((data) => {
        const filteredSongs = data.filter(
          (song) => !playlist?.songs?.includes(song._id)
        );
        setAvailableSongs(filteredSongs);
      });
  };

  const handleRemoveSong = async (songId) => {
    await dispatch(removeSongFromPlaylist({ playlistId: id, songId }));
  };

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

  if (!playlist) return null;

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
              {playlist.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              {playlist.songs?.length} songs • {playlist.mood}
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 200,
                bgcolor: 'primary.main',
                borderRadius: 1,
                mb: 2,
              }}
            />
          </Paper>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Add Songs
            </Typography>
            <TextField
              fullWidth
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
            />
            <List>
              {availableSongs
                .filter((song) =>
                  song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  song.artist.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((song) => (
                  <motion.div key={song._id} variants={itemVariants}>
                    <ListItem
                      button
                      onClick={() => setSelectedSong(song)}
                      sx={{
                        backgroundColor:
                          selectedSong?._id === song._id ? 'action.hover' : 'transparent',
                      }}
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
                            handleAddSong(song._id);
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
            </List>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              Playlist Songs
            </Typography>
            <List>
              {playlist.songs?.map((songId) => (
                <motion.div key={songId} variants={itemVariants}>
                  <ListItem
                    button
                    onClick={() => handlePlaySong({ _id: songId })}
                  >
                    <ListItemText
                      primary={`Song ${songId}`}
                      secondary="Artist Name"
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSong(songId);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Playlist;
