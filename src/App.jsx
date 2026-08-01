import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import MovieDetails from './components/MovieDetails';
import EmptyState from './components/EmptyState';
import Carousel from './components/Carousel';
import GenreFilter from './components/GenreFilter';
import Billboard from './components/Billboard';
import { searchMovies, getTrendingMovies, getRecentMovies, getTrendingSeries, getMoviesByGenre, getBollywoodMovies, getHollywoodMovies, getKoreanDramasHindiDubbed } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'watchlist'
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('movieDekho_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  
  const [trending, setTrending] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [recent, setRecent] = useState([]);
  const [bollywood, setBollywood] = useState([]);
  const [hollywood, setHollywood] = useState([]);
  const [koreanHindi, setKoreanHindi] = useState([]);
  
  const [activeGenre, setActiveGenre] = useState('');
  const [genreMovies, setGenreMovies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    localStorage.setItem('movieDekho_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [
          trendingData,
          seriesData,
          recentData,
          bollyData,
          hollyData,
          koreanData
        ] = await Promise.all([
          getTrendingMovies(),
          getTrendingSeries(),
          getRecentMovies(),
          getBollywoodMovies(),
          getHollywoodMovies(),
          getKoreanDramasHindiDubbed()
        ]);
        
        setTrending(trendingData);
        setTrendingSeries(seriesData);
        setRecent(recentData);
        setBollywood(bollyData);
        setHollywood(hollyData);
        setKoreanHindi(koreanData);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setQuery('');
      setMovies([]);
      setCurrentView('home');
      return;
    }
    
    setQuery(searchQuery);
    setPage(1);
    setLoading(true);
    setHasSearched(true);
    setCurrentView('home'); // Ensure we switch out of watchlist to see search results
    
    try {
      const results = await searchMovies(searchQuery, 1);
      setMovies(results.Search);
      setTotalResults(parseInt(results.totalResults) || 0);
    } catch (error) {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const results = await searchMovies(query, nextPage);
      if (results.Search && results.Search.length > 0) {
        setMovies(prev => [...prev, ...results.Search]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleGenreSelect = async (genre) => {
    if (activeGenre === genre) {
      setActiveGenre('');
      setGenreMovies([]);
      return;
    }
    
    setActiveGenre(genre);
    setLoading(true);
    setHasSearched(false);
    setQuery('');
    const results = await getMoviesByGenre(genre);
    setGenreMovies(results);
    setLoading(false);
  };

  const toggleWatchlist = (movie, e) => {
    if (e) e.stopPropagation();
    setWatchlist(prev => {
      const exists = prev.find(m => m.imdbID === movie.imdbID);
      if (exists) {
        return prev.filter(m => m.imdbID !== movie.imdbID);
      } else {
        return [...prev, movie];
      }
    });
  };

  const closeDetails = () => {
    setSelectedMovie(null);
  };

  const isWatchlistMode = currentView === 'watchlist';
  const showDefaultHome = !loading && !hasSearched && activeGenre === '' && !isWatchlistMode;

  return (
    <div className="app-container">
      <Header 
        currentView={currentView} 
        onSearch={handleSearch}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'watchlist') {
            setHasSearched(false);
            setActiveGenre('');
            setQuery('');
          }
        }} 
      />
      
      <main className="main-content">
        {!isWatchlistMode && !hasSearched && activeGenre === '' && trending.length > 0 && (
          <Billboard 
            movies={trending.slice(0, 5)} 
            onPlay={setSelectedMovie}
            onMoreInfo={setSelectedMovie}
          />
        )}

        <div className="container" style={{ marginTop: (!isWatchlistMode && !hasSearched && activeGenre === '') ? '-10vh' : '100px', zIndex: 10, position: 'relative' }}>
          
          {!isWatchlistMode && !hasSearched && (
            <div style={{ marginBottom: '2rem' }}>
              <GenreFilter activeGenre={activeGenre} onGenreSelect={handleGenreSelect} />
            </div>
          )}

          {isWatchlistMode && (
            <div className="watchlist-section animate-fade-in">
              <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>My List</h1>
              {watchlist.length === 0 ? (
                <div className="empty-state">
                  <h2>Your list is empty</h2>
                  <p className="text-secondary">Save movies you want to watch later by clicking the heart icon.</p>
                </div>
              ) : (
                <div className="movie-grid">
                  {watchlist.map(movie => (
                    <MovieCard 
                      key={movie.imdbID} 
                      movie={movie} 
                      onClick={() => setSelectedMovie(movie)}
                      isSaved={true}
                      onToggleSave={(e) => toggleWatchlist(movie, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="results-section">
            {loading && !hasSearched && <div className="loader">Loading...</div>}
            
            {/* Genre Results */}
            {!loading && activeGenre !== '' && !isWatchlistMode && (
              <div className="movie-grid animate-fade-in">
                <h2 className="section-title" style={{ gridColumn: '1 / -1' }}>{activeGenre} Movies</h2>
                {genreMovies.map((movie) => (
                  <MovieCard 
                    key={movie.imdbID} 
                    movie={movie} 
                    onClick={() => setSelectedMovie(movie)}
                    isSaved={watchlist.some(m => m.imdbID === movie.imdbID)}
                    onToggleSave={(e) => toggleWatchlist(movie, e)}
                  />
                ))}
              </div>
            )}

            {/* Search Results */}
            {!loading && hasSearched && movies.length === 0 && !isWatchlistMode && (
              <div style={{ paddingTop: '50px' }}>
                <EmptyState query={query} />
              </div>
            )}

            {!loading && hasSearched && movies.length > 0 && !isWatchlistMode && (
              <div className="search-results-wrapper animate-fade-in" style={{ paddingTop: '20px' }}>
                <div className="movie-grid">
                  <h2 className="section-title" style={{ gridColumn: '1 / -1' }}>Search Results for "{query}"</h2>
                  {movies.map((movie) => (
                    <MovieCard 
                      key={movie.imdbID} 
                      movie={movie} 
                      onClick={() => setSelectedMovie(movie)}
                      isSaved={watchlist.some(m => m.imdbID === movie.imdbID)}
                      onToggleSave={(e) => toggleWatchlist(movie, e)}
                    />
                  ))}
                </div>
                
                {movies.length < totalResults && (
                  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button 
                      className="btn btn-outline" 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Default View (Trending & Recent) */}
            {showDefaultHome && (
              <div className="animate-fade-in">
                {initialLoading ? (
                  <div className="loader" style={{ marginTop: '100px' }}>Loading movies...</div>
                ) : (
                  <>
                    <Carousel 
                      title="Trending Now" 
                      movies={trending.slice(5)} 
                      fetchMore={getTrendingMovies}
                      onMovieSelect={setSelectedMovie} 
                      watchlist={watchlist}
                      onToggleSave={toggleWatchlist}
                    />
                    <Carousel 
                      title="Popular TV Shows" 
                      movies={trendingSeries} 
                      fetchMore={getTrendingSeries}
                      onMovieSelect={setSelectedMovie} 
                      watchlist={watchlist}
                      onToggleSave={toggleWatchlist}
                    />
                    <Carousel 
                      title="New Releases" 
                      movies={recent} 
                      fetchMore={getRecentMovies}
                      onMovieSelect={setSelectedMovie}
                      watchlist={watchlist}
                      onToggleSave={toggleWatchlist}
                    />
                    <Carousel 
                      title="Bollywood Blockbusters" 
                      movies={bollywood} 
                      fetchMore={getBollywoodMovies}
                      onMovieSelect={setSelectedMovie}
                      watchlist={watchlist}
                      onToggleSave={toggleWatchlist}
                    />
                    <Carousel 
                      title="Hollywood Hits" 
                      movies={hollywood} 
                      fetchMore={getHollywoodMovies}
                      onMovieSelect={setSelectedMovie}
                      watchlist={watchlist}
                      onToggleSave={toggleWatchlist}
                    />
                    <Carousel 
                      title="Korean Dramas (Hindi Dubbed)" 
                      movies={koreanHindi} 
                      fetchMore={getKoreanDramasHindiDubbed}
                      onMovieSelect={setSelectedMovie}
                      watchlist={watchlist}
                      onToggleSave={toggleWatchlist}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedMovie && (
        <MovieDetails 
          movie={selectedMovie} 
          onClose={closeDetails} 
          isSaved={watchlist.some(m => m.imdbID === selectedMovie.imdbID)}
          onToggleSave={() => toggleWatchlist(selectedMovie)}
          onSimilarSelect={(movie) => setSelectedMovie(movie)}
        />
      )}
    </div>
  );
}

export default App;
