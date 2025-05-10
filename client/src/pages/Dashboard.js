// ... imports remain the same
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Paper, Typography,
  Button, TextField, useTheme, CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMoodBasedRecommendations, searchSongs } from '../services/spotifyService';
import { fetchPlaylists, createPlaylist } from '../store/slices/playlistSlice';
import { playTrack } from '../store/slices/playerSlice';
import { motion } from 'framer-motion';

const moodColors = {
  happy: '#FFD700',
  sad: '#87CEEB',
  energetic: '#FF69B4',
  calm: '#98FB98',
  romantic: '#FFB6C1',
  angry: '#FF4500',
  chill: '#ADD8E6',
};

// ✅ Reusable TrackCard component
const TrackCard = ({ track, mood, onClick }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          display: 'flex',
          mb: 1,
          height: 160,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          borderRadius: 1,
          bgcolor: 'rgba(0, 0, 0, 0.08)',
        }}
      >
        {track.album?.cover_medium ? (
          <img
            src={track.album.cover_medium}
            alt={track.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: moodColors[mood] || theme.palette.primary.main,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
            }}
          >
            <Typography variant="h6">{track.title.charAt(0)}</Typography>
          </Box>
        )}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {track.title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {track.artist.name}
      </Typography>
    </Paper>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { playlists, loading } = useSelector((state) => state.playlist);
  const { currentTrack } = useSelector((state) => state.player);

  const [selectedMood, setSelectedMood] = useState(location.state?.mood || 'happy');
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleSpotifyCallback = () => {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expires_in = params.get('expires_in');

        if (accessToken) {
          localStorage.setItem('spotify_access_token', accessToken);
          if (refreshToken) localStorage.setItem('spotify_refresh_token', refreshToken);
          if (expires_in) {
            const expiryTime = Date.now() + parseInt(expires_in) * 1000;
            localStorage.setItem('spotify_token_expiry', expiryTime.toString());
          }
          setIsAuthenticated(true);
          window.history.replaceState({}, document.title, '/dashboard');
        }
      }
    };
    handleSpotifyCallback();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    dispatch(fetchPlaylists());
    if (isAuthenticated) fetchRecommendations();
  }, [dispatch, selectedMood, isAuthenticated]);

  const fetchRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      const recs = await getMoodBasedRecommendations(selectedMood);
      setRecommendations(recs || []);
    } catch {
      setError('Error fetching recommendations. Please try again.');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return setSearchResults([]);
    try {
      setSearchLoading(true);
      const results = await searchSongs(query);
      setSearchResults(results);
    } catch {
      setError('Error searching songs');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreatePlaylist = async () => {
    const name = prompt('Enter playlist name:');
    if (name) await dispatch(createPlaylist({ name, mood: selectedMood }));
  };

  const handleSpotifyLogin = () => {
    window.location.href = 'https://project-amplify-backend.vercel.app/api/spotify/login';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {!isAuthenticated && (
          <Paper elevation={3} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1DB954', color: 'white' }}>
            <Typography variant="h6">Connect with Spotify to unlock full features</Typography>
            <Button variant="contained" color="secondary" onClick={handleSpotifyLogin} sx={{ fontWeight: 'bold' }}>
              Connect with Spotify
            </Button>
          </Paper>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" gutterBottom>Moodify</Typography>
              <Typography variant="subtitle1" gutterBottom>Discover music that matches your mood</Typography>

              <TextField fullWidth label="Search for songs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} variant="outlined" sx={{ my: 3 }} />
              {searchLoading && <CircularProgress size={24} sx={{ ml: 2 }} />}
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

              {searchResults.length > 0 ? (
                <Grid container spacing={2}>
                  {searchResults.map((track) => (
                    <Grid item xs={12} sm={6} md={4} key={track.id}>
                      <TrackCard track={track} mood={selectedMood} onClick={() => dispatch(playTrack(track))} />
                    </Grid>
                  ))}
                </Grid>
              ) : !searchQuery && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Mood Recommendations
                  </Typography>
                  {recommendationsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}><CircularProgress /></Box>
                  ) : recommendations.length > 0 ? (
                    <Grid container spacing={2}>
                      {recommendations.map((track) => (
                        <Grid item xs={12} sm={6} md={4} key={track.id}>
                          <TrackCard track={track} mood={selectedMood} onClick={() => dispatch(playTrack(track))} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography>
                      {isAuthenticated ? 'No recommendations available. Try a different mood.' : 'Connect with Spotify to see recommendations.'}
                    </Typography>
                  )}
                </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Select a Mood</Typography>
              <Grid container spacing={2}>
                {Object.keys(moodColors).map((mood) => (
                  <Grid item xs={6} key={mood}>
                    <Button
                      fullWidth
                      variant={selectedMood === mood ? 'contained' : 'outlined'}
                      sx={{
                        bgcolor: selectedMood === mood ? moodColors[mood] : 'transparent',
                        borderColor: moodColors[mood],
                        color: selectedMood === mood ? 'white' : moodColors[mood],
                        '&:hover': {
                          bgcolor: selectedMood === mood ? moodColors[mood] : `${moodColors[mood]}22`,
                        },
                        textTransform: 'capitalize',
                      }}
                      onClick={() => setSelectedMood(mood)}
                    >
                      {mood}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Your Playlists</Typography>
                <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }} onClick={handleCreatePlaylist}>
                  Create New Playlist
                </Button>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={24} /></Box>
                ) : playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <Paper
                      key={playlist._id}
                      elevation={1}
                      sx={{ p: 2, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' } }}
                      onClick={() => navigate(`/playlist/${playlist._id}`)}
                    >
                      <Typography variant="subtitle1">{playlist.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {playlist.mood && `Mood: ${playlist.mood}`} {playlist.songs?.length > 0 && `• ${playlist.songs.length} songs`}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2">No playlists yet. Create your first one!</Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
