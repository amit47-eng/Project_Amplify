import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addSong } from '../store/slices/songSlice';

const AddSong = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    mood: 'happy',
    duration: 0,
    thumbnail: '',
    audioUrl: '',
  });
  const dispatch = useDispatch();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: '',
      artist: '',
      album: '',
      mood: 'happy',
      duration: 0,
      thumbnail: '',
      audioUrl: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addSong(formData));
      handleClose();
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  return (
    <>
      <IconButton color="primary" onClick={handleOpen}>
        <AddIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Add New Song</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Title"
              name="title"
              fullWidth
              required
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Artist"
              name="artist"
              fullWidth
              required
              value={formData.artist}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Album"
              name="album"
              fullWidth
              required
              value={formData.album}
              onChange={handleChange}
            />
            <FormControl margin="dense" fullWidth>
              <InputLabel>Mood</InputLabel>
              <Select
                name="mood"
                value={formData.mood}
                onChange={handleChange}
                label="Mood"
              >
                <MenuItem value="happy">Happy</MenuItem>
                <MenuItem value="sad">Sad</MenuItem>
                <MenuItem value="energetic">Energetic</MenuItem>
                <MenuItem value="calm">Calm</MenuItem>
                <MenuItem value="romantic">Romantic</MenuItem>
                <MenuItem value="angry">Angry</MenuItem>
                <MenuItem value="chill">Chill</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Duration (seconds)"
              name="duration"
              type="number"
              fullWidth
              required
              value={formData.duration}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Thumbnail URL"
              name="thumbnail"
              fullWidth
              required
              value={formData.thumbnail}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="Audio URL"
              name="audioUrl"
              fullWidth
              required
              value={formData.audioUrl}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Song
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default AddSong;
