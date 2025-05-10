const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('querystring');

// Validate environment variables
['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'REDIRECT_URI'].forEach(key => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
});

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  REDIRECT_URI
} = process.env;

// Spotify Login - returns auth URL
router.get('/login', (req, res) => {
  const params = qs.stringify({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: 'user-read-private user-read-email streaming',
    redirect_uri: REDIRECT_URI,
  });

  res.json({ redirectUrl: `https://accounts.spotify.com/authorize?${params}` });
});

// Spotify Callback - exchanges code for token
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect(`http://localhost:3000/?error=missing_code`);

  try {
    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, expires_in } = data;
    res.redirect(`http://localhost:3000/#access_token=${encodeURIComponent(access_token)}&expires_in=${expires_in}`);
  } catch (err) {
    console.error('Spotify callback error:', err.response?.data || err.message);
    res.redirect(`http://localhost:3000/?error=${encodeURIComponent(err.message)}`);
  }
});

module.exports = router;
