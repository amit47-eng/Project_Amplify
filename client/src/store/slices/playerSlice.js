import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  isShuffling: false,
  isRepeating: false,
  progress: 0,
  duration: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    playTrack: (state, action) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    pauseTrack: (state) => {
      state.isPlaying = false;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    toggleShuffle: (state) => {
      state.isShuffling = !state.isShuffling;
    },
    toggleRepeat: (state) => {
      state.isRepeating = !state.isRepeating;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
  },
});

export const {
  playTrack,
  pauseTrack,
  setVolume,
  toggleShuffle,
  toggleRepeat,
  setProgress,
  setDuration,
} = playerSlice.actions;

export default playerSlice.reducer;
