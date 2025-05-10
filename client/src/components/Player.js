import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Slider,
  Typography,
  IconButton,
  Stack,
  useTheme,
  Grid,
  Paper,
  Button,
  useMediaQuery,
  useScrollTrigger,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipPrevious as SkipPreviousIcon,
  SkipNext as SkipNextIcon,
  VolumeDown as VolumeDownIcon,
  VolumeUp as VolumeUpIcon,
  Shuffle as ShuffleIcon,
  Repeat as RepeatIcon,
  Equalizer as EqualizerIcon,
  PlaylistAdd as PlaylistAddIcon,
  Favorite as FavoriteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { pauseTrack, playTrack } from '../store/slices/playerSlice';
import { getProxiedAudioUrl } from '../services/spotifyService';

const Player = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state) => state.player);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [equalizerValues, setEqualizerValues] = useState([
    50, 50, 50, 50, 50, 50, 50, 50, 50, 50
  ]);
  const [audioError, setAudioError] = useState('');
  
  // Map fallback keys to working MP3 preview URLs
  const previewMap = {
    hindi1: 'https://cdns-preview-7.dzcdn.net/stream/c-74e01b78405a3c3b922035b718de4a00-3.mp3',
    hindi2: 'https://cdns-preview-d.dzcdn.net/stream/c-d63da5a566c95c8da93545fae423cc0f-3.mp3',
    hindi3: 'https://cdns-preview-7.dzcdn.net/stream/c-7aa136ec7d02b409bb4f79042633853b-5.mp3',
    hindi4: 'https://cdns-preview-a.dzcdn.net/stream/c-af5e39ba1b02a0ef330c915c5213ace0-4.mp3',
    english1: 'https://cdns-preview-d.dzcdn.net/stream/c-d6cfc27f9615c3a2ff20d17638880210-6.mp3',
    english2: 'https://cdns-preview-2.dzcdn.net/stream/c-2673d0d4ad19734c7bf0ce740d60a484-5.mp3',
    english3: 'https://cdns-preview-e.dzcdn.net/stream/c-e77d23e0c8ed7567a507a6d1b6a9ca1b-6.mp3',
  };

  // HTML5 audio element reference
  const audioRef = useRef(null);

  // When currentTrack changes, load its preview URL and play if isPlaying
  useEffect(() => {
    if (!currentTrack) return;

    const audio = audioRef.current;
    if (!audio) return;

    setAudioError('');

    // Get the preview URL from the track
    let src = currentTrack.preview;
    
    // Try different fallback options if no preview URL is available
    if (!src || src === '') {
      console.log('No preview URL in track, trying fallbacks...');
      // If src is a key in our previewMap, use that value
      if (previewMap[currentTrack.id]) {
        src = previewMap[currentTrack.id];
      } else if (Object.keys(previewMap).length > 0) {
        // If no direct match, use a random fallback from our previewMap
        const keys = Object.keys(previewMap);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        src = previewMap[randomKey];
        console.log('Using random fallback preview:', randomKey);
      }
    }
    
    console.log('Audio source URL:', src); // Log the audio source URL
    
    if (!src || src === '') {
      console.error('No valid audio source URL found');
      setAudioError('This track has no preview available');
      return;
    }
    
    // Set the audio source
    audio.src = src;
    audio.load(); // Explicitly load the audio

    if (isPlaying) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Audio play error:', err);
          setAudioError('Unable to play this track. Try another.');
        });
      }
    }
  }, [currentTrack]);

  // Play or pause when isPlaying flag toggles
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch((err) => console.error('Audio play error:', err));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      // Ensure volume is within valid range [0, 1]
      const safeVolume = Math.min(Math.max(volume, 0), 1);
      audioRef.current.volume = safeVolume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (currentTrack) {
      if (isPlaying) {
        dispatch(pauseTrack());
      } else {
        dispatch(playTrack(currentTrack));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEqualizerChange = (index, value) => {
    const newValues = [...equalizerValues];
    newValues[index] = value;
    setEqualizerValues(newValues);
    // Apply equalizer settings to audio
    // This would typically be implemented with Web Audio API
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAudioError = () => {
    if (!currentTrack || !audioRef.current) return;
    const fallbackSrc = getProxiedAudioUrl(currentTrack.preview);
    console.log('Fallback audio source URL:', fallbackSrc); // Log the fallback URL
    if (audioRef.current.src !== fallbackSrc) {
      audioRef.current.src = fallbackSrc;
      audioRef.current
        .play()
        .catch((err) => console.error('Fallback play error:', err));
    } else {
      setAudioError('Unable to play this track.');
      dispatch(pauseTrack());
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'background.paper',
        padding: '16px',
        borderTop: `1px solid ${theme.palette.divider}`,
        height: isFullscreen ? '100vh' : 'auto',
        transition: 'height 0.3s ease',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <img
          src="/default-album.png"
          alt="Album"
          style={{ width: 48, height: 48, borderRadius: 8 }}
        />
        <Box>
          <Typography variant="subtitle1" color="primary">
            {currentTrack ? currentTrack.title : 'No track selected'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentTrack ? currentTrack.artist.name : 'Select a track to play'}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={() => setIsShuffling(!isShuffling)}>
          <ShuffleIcon color={isShuffling ? 'primary' : 'inherit'} />
        </IconButton>
        <IconButton onClick={() => setIsRepeating(!isRepeating)}>
          <RepeatIcon color={isRepeating ? 'primary' : 'inherit'} />
        </IconButton>
        <IconButton onClick={handlePlayPause}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton>
          <SkipNextIcon />
        </IconButton>
        <Box sx={{ width: 200, ml: 2 }}>
          <Slider
            value={currentTime}
            max={duration}
            onChange={(e, value) => {
              if (audioRef.current) {
                audioRef.current.currentTime = value;
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => setVolume(volume - 0.1)}>
            <VolumeDownIcon />
          </IconButton>
          <Slider
            value={volume * 100}
            min={0}
            max={100}
            size="small"
            onChange={(e, value) => setVolume(value / 100)}
          />
          <IconButton onClick={() => setVolume(volume + 0.1)}>
            <VolumeUpIcon />
          </IconButton>
        </Box>
      </Stack>
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => dispatch(pauseTrack())}
        onError={handleAudioError}
      />
      {audioError && (
        <Typography variant="caption" color="error" sx={{ ml: 2 }}>
          {audioError}
        </Typography>
      )}
      {isFullscreen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'background.paper',
            padding: '24px',
            zIndex: 1000,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
            Equalizer
          </Typography>
          <Grid container spacing={2}>
            {equalizerValues.map((value, index) => (
              <Grid item xs={2} key={index}>
                <Typography variant="caption" align="center">
                  {['Bass', 'Low', 'Mid', 'High', 'Treble'][index % 5]}
                </Typography>
                <Slider
                  value={value}
                  onChange={(e, newValue) => handleEqualizerChange(index, newValue)}
                  min={0}
                  max={100}
                  sx={{
                    color: 'primary.main',
                    '& .MuiSlider-track': {
                      color: 'primary.light',
                    },
                  }}
                />
                <Typography variant="caption" align="center">
                  {value}
                </Typography>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFullscreen}
              startIcon={<EqualizerIcon />}
            >
              Close Equalizer
            </Button>
          </Box>
        </Box>
      )}

      <IconButton
        size="small"
        sx={{ position: 'absolute', right: 16, top: 16 }}
        onClick={handleFullscreen}
      >
        <EqualizerIcon color="primary" />
      </IconButton>

    </Box>
  );
};

export default Player;
