import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  songs: [],
  loading: false,
  error: null,
};

export const addSong = createAsyncThunk(
  'songs/addSong',
  async (songData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/songs', songData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error adding song');
    }
  }
);

const songSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addSong.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSong.fulfilled, (state, action) => {
        state.loading = false;
        state.songs.push(action.payload);
      })
      .addCase(addSong.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default songSlice.reducer;
