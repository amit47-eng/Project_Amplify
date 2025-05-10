import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import {
  Home as HomeIcon,
  QueueMusic as QueueMusicIcon,
  Favorite as FavoriteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import Player from './Player';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  width: `calc(100% - ${drawerWidth}px)`,
  marginLeft: drawerWidth,
}));

const Layout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Moods', icon: <QueueMusicIcon />, path: '/dashboard/moods' },
    { text: 'Favorites', icon: <FavoriteIcon />, path: '/favorites' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={location.pathname === item.path}
              component={RouterLink}
              to={item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'background.paper',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main>
        {children}
      </Main>
      <Player />
    </Box>
  );
};

export default Layout;
