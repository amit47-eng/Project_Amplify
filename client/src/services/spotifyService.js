import axios from 'axios';

// API URLs
const API_BASE_URL = 'http://localhost:5000/api';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Axios instance for local server APIs
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store tokens in localStorage
let accessToken = localStorage.getItem('spotify_access_token');
let refreshToken = localStorage.getItem('spotify_refresh_token');
let tokenExpiryTime = localStorage.getItem('spotify_token_expiry');

// Check URL hash for tokens on load (from Spotify callback)
const checkUrlForTokens = () => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const newAccessToken = params.get('access_token');
      const newRefreshToken = params.get('refresh_token');
      const expiresIn = params.get('expires_in');

      if (newAccessToken) {
        accessToken = newAccessToken;
        localStorage.setItem('spotify_access_token', newAccessToken);

        if (newRefreshToken) {
          refreshToken = newRefreshToken;
          localStorage.setItem('spotify_refresh_token', newRefreshToken);
        }

        if (expiresIn) {
          const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
          tokenExpiryTime = expiryTime;
          localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        }

        // Clear hash to avoid keeping tokens in URL
        window.location.hash = '';
      }
    }
  }
};

// Run check on module load
checkUrlForTokens();

// Helper function to check if token is expired
const isTokenExpired = () => {
  return !tokenExpiryTime || Date.now() > parseInt(tokenExpiryTime);
};

// Get auth URL from server
export const getAuthUrl = async () => {
  try {
    const response = await api.get('/spotify/login');
    return response.data.redirectUrl;
  } catch (error) {
    console.error('Failed to get auth URL:', error);
    return null;
  }
};

// Store access token from Spotify callback
export const getAccessToken = (token) => {
  if (token) {
    accessToken = token;
    localStorage.setItem('spotify_access_token', token);
    return token;
  }
  return accessToken;
};

// Clear tokens on logout
export const clearAccessToken = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
};

// Refresh token when expired
const refreshAccessToken = async () => {
  try {
    if (!refreshToken) return null;
    
    const response = await api.post('/spotify/refresh-token', { refresh_token: refreshToken });
    const { access_token, expires_in } = response.data;
    
    accessToken = access_token;
    tokenExpiryTime = Date.now() + expires_in * 1000;
    
    localStorage.setItem('spotify_access_token', access_token);
    localStorage.setItem('spotify_token_expiry', tokenExpiryTime.toString());
    
    return access_token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearAccessToken();
    return null;
  }
};

// Get valid token (refreshing if needed)
const getValidToken = async () => {
  if (!accessToken) return null;
  
  if (isTokenExpired()) {
    return await refreshAccessToken();
  }
  
  return accessToken;
};

// Spotify API client
const spotifyApi = async (endpoint, method = 'GET', data = null) => {
  const token = await getValidToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  try {
    const response = await axios({
      method,
      url: `${SPOTIFY_API_BASE}${endpoint}`,
      data,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Spotify API error (${endpoint}):`, error);
    
    if (error.response?.status === 401) {
      // Token might be invalid despite our check, try refreshing
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        const retryResponse = await axios({
          method,
          url: `${SPOTIFY_API_BASE}${endpoint}`,
          data,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        return retryResponse.data;
      }
    }
    
    throw error;
  }
};

export const searchSongs = async (query, limit = 20) => {
  try {
    // Check if we're authenticated
    const token = await getValidToken();
    if (!token) {
      console.error('No valid Spotify token available. Please authenticate first.');
      // Return sample tracks as a fallback
      return sampleTracks.slice(0, limit);
    }
    
    console.log('Searching with query:', query, 'using token:', token.substring(0, 10) + '...');
    
    // Try to add Hindi/Bollywood context if not specified
    const isHindiQuery = /[\u0900-\u097F]/.test(query) || 
                         query.toLowerCase().includes('hindi') || 
                         query.toLowerCase().includes('bollywood');
    
    try {
      if (!isHindiQuery) {
        // Search with the regular query (half the results)
        const regularLimit = Math.ceil(limit / 2);
        const regularResponse = await api.get(`/spotify/search`, {
          params: {
            query,
            access_token: token,
            limit: regularLimit
          }
        });
        
        // Search with Bollywood context for Hindi results (half the results)
        const hindiLimit = Math.floor(limit / 2);
        const hindiQuery = `${query} bollywood`;
        const hindiResponse = await api.get(`/spotify/search`, {
          params: {
            query: hindiQuery,
            access_token: token,
            limit: hindiLimit
          }
        });
        
        // Combine results
        const allResults = [
          ...(regularResponse.data || []),
          ...(hindiResponse.data || [])
        ];
        
        console.log('Search results:', allResults.length);
        
        // Remove duplicates
        const uniqueResults = allResults.filter((track, index, self) => 
          index === self.findIndex(t => t.id === track.id)
        );
        
        return uniqueResults.slice(0, limit);
      } else {
        // If already looking for Hindi content, just do the direct search
        const response = await api.get(`/spotify/search`, {
          params: {
            query,
            access_token: token,
            limit
          }
        });
        
        console.log('Hindi search results:', response.data?.length || 0);
        return response.data || [];
      }
    } catch (apiError) {
      console.error('API error during search:', apiError);
      return sampleTracks.slice(0, limit);
    }
  } catch (error) {
    console.error('Error searching songs:', error);
    return sampleTracks.slice(0, limit);
  }
};

export const getMoodBasedRecommendations = async (mood) => {
  try {
    // Check if we're authenticated
    const token = await getValidToken();
    if (!token) {
      console.error('No valid Spotify token available for recommendations');
      return sampleTracks;
    }
    
    console.log('Getting recommendations for mood:', mood);
    
    try {
      // Get recommendations from our server endpoint
      const response = await api.get(`/spotify/recommendations/${mood}`, {
        params: {
          access_token: token
        }
      });
      
      console.log('Recommendations received:', response.data?.length || 0);
      
      // Filter out tracks without preview URLs and add fallback URL if needed
      const tracksWithPreviews = response.data.map(track => {
        if (!track.preview || track.preview === '') {
          // Add a fallback preview URL from our sample tracks
          const randomSample = sampleTracks[Math.floor(Math.random() * sampleTracks.length)];
          return {
            ...track,
            preview: randomSample.preview || 'https://cdn.freesound.org/previews/649/649586_5674468-lq.mp3'
          };
        }
        return track;
      });
      
      return tracksWithPreviews || sampleTracks;
    } catch (apiError) {
      console.error('API error during recommendations:', apiError);
      return sampleTracks;
    }
  } catch (error) {
    console.error('Error getting mood recommendations:', error);
    return sampleTracks;
  }
};

// Helper function to get Hindi songs specifically
export const getHindiSongs = async (limit = 10) => {
  try {
    // Check if we're authenticated
    const token = await getValidToken();
    if (!token) return hindiSampleTracks;
    
    // Search specifically for Bollywood songs
    const response = await api.get(`/spotify/search`, {
      params: {
        query: 'bollywood hindi',
        access_token: token,
        limit
      }
    });
    
    return response.data || hindiSampleTracks;
  } catch (error) {
    console.error('Error searching Hindi songs:', error);
    return hindiSampleTracks;
  }
};

// Hindi sample tracks
const hindiSampleTracks = [
  {
    id: 701,
    title: 'Raataan Lambiyan',
    artist: { name: 'Jubin Nautiyal, Asees Kaur' },
    album: { title: 'Shershaah', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/30d377c78edd4694c2979a83a707da4e/250x250-000000-80-0-0.jpg' },
    preview: 'https://cdns-preview-7.dzcdn.net/stream/c-74e01b78405a3c3b922035b718de4a00-3.mp3',
  },
  {
    id: 702,
    title: 'Kesariya',
    artist: { name: 'Arijit Singh' },
    album: { title: 'Brahmastra', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/9c3068df4f608e6a086e9e5fd22b95ab/250x250-000000-80-0-0.jpg' },
    preview: 'https://cdns-preview-d.dzcdn.net/stream/c-d63da5a566c95c8da93545fae423cc0f-3.mp3',
  },
  {
    id: 703,
    title: 'Chaiyya Chaiyya',
    artist: { name: 'Sukhwinder Singh, Sapna Awasthi' },
    album: { title: 'Dil Se', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/3ed374dbce1f41bac103f1c0574a1063/250x250-000000-80-0-0.jpg' },
    preview: 'https://cdns-preview-7.dzcdn.net/stream/c-7aa136ec7d02b409bb4f79042633853b-5.mp3',
  },
];

// Function to get a working audio URL
export const getProxiedAudioUrl = (url) => {
  // Free, reliable audio samples from public sources
  const reliableAudioSamples = [
    // Guaranteed to work sample from freesound.org
    'https://cdn.freesound.org/previews/649/649586_5674468-lq.mp3',
    // Additional reliable samples from free public sources
    'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav',
    'https://www2.cs.uic.edu/~i101/SoundFiles/taunt.wav',
    'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav',
    'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav'
  ];
  
  // Return URL if it's already valid
  if (url && url.startsWith('http')) {
    // Check if it's a Spotify preview URL which should work
    if (url.includes('spotify') || url.includes('audio-preview')) {
      return url;
    }
  }

  // Pick a random sample from our reliable sources
  const randomIndex = Math.floor(Math.random() * reliableAudioSamples.length);
  console.log('Using reliable audio sample #' + randomIndex);
  return reliableAudioSamples[randomIndex];
};

// Sample tracks to return as fallback if the API fails
const sampleTracks = [
  // Hindi/Bollywood tracks
  {
    id: 701,
    title: 'Raataan Lambiyan',
    artist: { name: 'Jubin Nautiyal, Asees Kaur' },
    album: { title: 'Shershaah', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/30d377c78edd4694c2979a83a707da4e/250x250-000000-80-0-0.jpg' },
    preview: 'hindi1', // Reference to our local audio map
  },
  {
    id: 702,
    title: 'Kesariya',
    artist: { name: 'Arijit Singh' },
    album: { title: 'Brahmastra', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/9c3068df4f608e6a086e9e5fd22b95ab/250x250-000000-80-0-0.jpg' },
    preview: 'hindi2', // Reference to our local audio map
  },
  {
    id: 703,
    title: 'Chaiyya Chaiyya',
    artist: { name: 'Sukhwinder Singh, Sapna Awasthi' },
    album: { title: 'Dil Se', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/3ed374dbce1f41bac103f1c0574a1063/250x250-000000-80-0-0.jpg' },
    preview: 'hindi3', // Reference to our local audio map
  },
  {
    id: 704,
    title: 'Kala Chashma',
    artist: { name: 'Amar Arshi, Badshah, Neha Kakkar' },
    album: { title: 'Baar Baar Dekho', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/e8c3e169b837cf489725f92860805748/250x250-000000-80-0-0.jpg' },
    preview: 'hindi4', // Reference to our local audio map
  },
  // English/International tracks
  {
    id: 1,
    title: 'Happy',
    artist: { name: 'Pharrell Williams' },
    album: { title: 'G I R L', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/b72d2a95edb26290b0ed1d50f3abe9e2/250x250-000000-80-0-0.jpg' },
    preview: 'english1', // Reference to our local audio map
  },
  {
    id: 2,
    title: 'Blinding Lights',
    artist: { name: 'The Weeknd' },
    album: { title: 'After Hours', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/fd00ebd6d30d7253a0d32cbef62e8990/250x250-000000-80-0-0.jpg' },
    preview: 'english2', // Reference to our local audio map
  },
  {
    id: 3,
    title: 'Dance Monkey',
    artist: { name: 'Tones and I' },
    album: { title: 'The Kids Are Coming', cover_medium: 'https://e-cdns-images.dzcdn.net/images/cover/a95cbeb974c4a7a18bfbd95e31f07bc1/250x250-000000-80-0-0.jpg' },
    preview: 'english3', // Reference to our local audio map
  },
];

const moodGenres = {
  happy: ['happy', 'pop', 'dance', 'electronic'],
  sad: ['sad', 'emo', 'indie', 'acoustic'],
  energetic: ['rock', 'metal', 'punk', 'hip hop'],
  calm: ['jazz', 'classical', 'chill', 'ambient'],
  romantic: ['love', 'romance', 'r&b', 'soul'],
  angry: ['metal', 'hard rock', 'rap', 'hardcore'],
  chill: ['chill', 'lofi', 'jazz', 'acoustic'],
};

const getMoodGenres = (mood) => {
  return moodGenres[mood] || moodGenres.happy;
};

export const getAudioFeatures = async (trackId) => {
  try {
    // Use our Spotify API client
    const data = await spotifyApi(`/audio-features/${trackId}`);
    return data;
  } catch (error) {
    console.error('Error getting audio features:', error);
    throw error;
  }
};

export const getTrack = async (trackId) => {
  try {
    // Use our Spotify API client
    const data = await spotifyApi(`/tracks/${trackId}`);
    return data;
  } catch (error) {
    console.error('Error getting track:', error);
    throw error;
  }
};
