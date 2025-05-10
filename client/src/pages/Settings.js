import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../store/slices/userSlice';
import { motion } from 'framer-motion';

const Settings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    notifications: true,
    darkMode: theme.palette.mode === 'dark',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUser(formData));
      // Update local storage if needed
      // window.location.reload();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
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
              Settings
            </Typography>
          </Paper>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Profile Information
            </Typography>
            <Paper elevation={3} sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Username"
                      secondary="Change your display name"
                    />
                    <TextField
                      variant="outlined"
                      size="small"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Email"
                      secondary="Your account email address"
                    />
                    <TextField
                      variant="outlined"
                      size="small"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      sx={{ width: '100%' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Notifications"
                      secondary="Receive notifications for new music and updates"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        name="notifications"
                        checked={formData.notifications}
                        onChange={handleChange}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Dark Mode"
                      secondary="Switch between light and dark themes"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        name="darkMode"
                        checked={formData.darkMode}
                        onChange={handleChange}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Save Changes
                </Button>
              </form>
            </Paper>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              Account
            </Typography>
            <Paper elevation={3} sx={{ p: 3 }}>
              <List>
                <ListItem button onClick={() => navigate('/profile')}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem button onClick={() => navigate('/privacy')}>
                  <ListItemIcon>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText primary="Privacy" />
                </ListItem>
                <ListItem button onClick={() => navigate('/notifications')}>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Settings;
