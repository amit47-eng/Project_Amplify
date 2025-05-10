import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import playlistReducer from './slices/playlistSlice';
import playerReducer from './slices/playerSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    playlist: playlistReducer,
    player: playerReducer,
  },
});

export default store;
