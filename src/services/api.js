const API_KEY = '92b418e837b833be308bbfb1fb2aca1e'; // Public TMDB demo key
const BASE_URL = 'https://api.themoviedb.org/3';

// Map TMDB structure to match our existing App expectations
const mapMovie = (m) => ({
  imdbID: m.id.toString(),
  Title: m.title || m.name,
  Year: (m.release_date || m.first_air_date || '').substring(0, 4),
  Poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "N/A",
  Type: m.title ? 'movie' : 'series',
  imdbRating: m.vote_average ? m.vote_average.toFixed(1) : "N/A",
  Backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
  Plot: m.overview || ""
});

const mapDetails = (m) => {
  const trailer = m.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer') || 
                  m.videos?.results?.find(v => v.site === 'YouTube');
  
  return {
    imdbID: m.id.toString(),
    Title: m.title || m.name,
    Year: (m.release_date || m.first_air_date || '').substring(0, 4),
    Poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "N/A",
    Backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
    Plot: m.overview || "No plot available.",
    Actors: m.credits?.cast?.length > 0 ? m.credits.cast.slice(0, 6).map(c => c.name).join(', ') : "N/A",
    ActorsFull: m.credits?.cast?.length > 0 ? m.credits.cast.slice(0, 10).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
    })) : [],
    TrailerKey: trailer ? trailer.key : null,
    Genre: m.genres?.length > 0 ? m.genres.map(g => g.name).join(', ') : "N/A",
    Runtime: m.runtime ? `${m.runtime} min` : "N/A",
    Rated: "N/A", 
    imdbRating: m.vote_average ? m.vote_average.toFixed(1) : "N/A",
    Ratings: []
  };
};

export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    const data = await response.json();
    return { 
      Search: (data.results || []).filter(m => m.poster_path).map(mapMovie), 
      totalResults: data.total_results 
    };
  } catch (error) {
    console.error("Error searching:", error);
    return { Search: [], totalResults: 0 };
  }
};

export const getMovieDetails = async (id) => {
  try {
    // We try movie first. If it fails, we try tv.
    let response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`);
    if (!response.ok) {
      response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,videos`);
    }
    const data = await response.json();
    if (data.id) return mapDetails(data);
    return null;
  } catch (error) {
    console.error("Error fetching details:", error);
    return null;
  }
};

export const getTrendingMovies = async (page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&page=${page}`);
    const data = await response.json();
    return (data.results || []).map(mapMovie);
  } catch (e) {
    return [];
  }
};

export const getRecentMovies = async (page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`);
    const data = await response.json();
    return (data.results || []).map(mapMovie);
  } catch (e) {
    return [];
  }
};

export const getTrendingSeries = async (page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}&page=${page}`);
    const data = await response.json();
    return (data.results || []).map(mapMovie);
  } catch (e) {
    return [];
  }
};

export const getBollywoodMovies = async (page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=${page}`);
    const data = await response.json();
    return (data.results || []).map(mapMovie);
  } catch (e) {
    return [];
  }
};

export const getHollywoodMovies = async (page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=en&sort_by=popularity.desc&page=${page}`);
    const data = await response.json();
    return (data.results || []).map(mapMovie);
  } catch (e) {
    return [];
  }
};

export const getMoviesByGenre = async (genreName) => {
  // Simple mock mapping for common genres to TMDB genre IDs
  const genreMap = {
    "Action": 28,
    "Comedy": 35,
    "Horror": 27,
    "Sci-Fi": 878,
    "Romance": 10749,
    "Thriller": 53,
    "Drama": 18,
    "Animation": 16,
    "Fantasy": 14,
    "Mystery": 9648
  };
  const genreId = genreMap[genreName] || 28;
  try {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`);
    const data = await response.json();
    return (data.results || []).map(mapMovie);
  } catch (e) {
    return [];
  }
};

export const getSimilarMovies = async (id) => {
  try {
    let response = await fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`);
    if (!response.ok) {
      response = await fetch(`${BASE_URL}/tv/${id}/similar?api_key=${API_KEY}`);
    }
    const data = await response.json();
    return (data.results || []).map(mapMovie);
  } catch (e) {
    return [];
  }
};

export const getKoreanDramasHindiDubbed = async (page = 1) => {
  try {
    const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ko&with_spoken_languages=hi&sort_by=popularity.desc&page=${page}`);
    const data = await response.json();
    return (data.results || []).map(m => ({ ...mapMovie(m), isHindiDubbed: true }));
  } catch (e) {
    return [];
  }
};

export const getMoviesByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  try {
    const promises = ids.map(async (id) => {
      let response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
      if (!response.ok) {
        response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
      }
      if (!response.ok) return null;
      const data = await response.json();
      return mapMovie(data);
    });
    
    const results = await Promise.all(promises);
    return results.filter(m => m !== null);
  } catch (e) {
    console.error("Error fetching available movies:", e);
    return [];
  }
};
