import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

const Landing = () => {
  const theme = useTheme();

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
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          padding: '4rem 0',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Typography
                variant="h2"
                component="h1"
                align="center"
                sx={{
                  color: 'background.paper',
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Amplify
              </Typography>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography
                variant="h4"
                align="center"
                color="background.paper"
                sx={{ mb: 4 }}
              >
                Feel the Beat of Your Mood
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <Button
                    variant="contained"
                    size="large"
                    href="/register"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      color: 'background.paper',
                    }}
                  >
                    Get Started
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="large"
                    href="/login"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      color: 'background.paper',
                    }}
                  >
                    Login
                  </Button>
                </Grid>
              </Grid>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Angry', 'Chill'].map((mood) => (
              <Grid item xs={12} sm={6} md={4} key={mood}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      height: '100%',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        transition: 'transform 0.2s ease-in-out',
                      },
                    }}
                  >
                    <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                      {mood}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Discover music that matches your mood
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
