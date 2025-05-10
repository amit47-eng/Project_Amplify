import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiService';

const initialState = {
  playlists: [],
  currentPlaylist: null,
  loading: false,
  error: null,
};

export const fetchPlaylists = createAsyncThunk(
  'playlist/fetchPlaylists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/playlists');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPlaylist = createAsyncThunk(
  'playlist/createPlaylist',
  async (playlistData, { rejectWithValue }) => {
    try {
      const response = await api.post('/playlists', playlistData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addSongToPlaylist = createAsyncThunk(
  'playlist/addSong',
  async ({ playlistId, songId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/playlists/${playlistId}/songs/${songId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeSongFromPlaylist = createAsyncThunk(
  'playlist/removeSong',
  async ({ playlistId, songId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    setCurrentPlaylist: (state, action) => {
      state.currentPlaylist = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists = action.payload;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch playlists';
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.playlists.push(action.payload);
      })
      .addCase(addSongToPlaylist.fulfilled, (state, action) => {
        const playlistIndex = state.playlists.findIndex(
          (playlist) => playlist._id === action.payload._id
        );
        if (playlistIndex !== -1) {
          state.playlists[playlistIndex] = action.payload;
        }
      })
      .addCase(removeSongFromPlaylist.fulfilled, (state, action) => {
        const playlistIndex = state.playlists.findIndex(
          (playlist) => playlist._id === action.payload._id
        );
        if (playlistIndex !== -1) {
          state.playlists[playlistIndex] = action.payload;
        }
      });
  },
});

export const { setCurrentPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
