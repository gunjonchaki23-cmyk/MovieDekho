import { useState, useEffect, useRef } from 'react';
import MovieCard from './MovieCard';
import './Carousel.css';

const Carousel = ({ title, movies: initialMovies, fetchMore, onMovieSelect, watchlist, onToggleSave }) => {
  const [localMovies, setLocalMovies] = useState(initialMovies || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setLocalMovies(initialMovies || []);
    setPage(1);
  }, [initialMovies]);

  const handleScroll = async () => {
    if (!scrollRef.current || !fetchMore || loading) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    // If scrolled near the end (within 100px)
    if (scrollWidth - scrollLeft - clientWidth < 100) {
      setLoading(true);
      try {
        const nextPage = page + 1;
        const newMovies = await fetchMore(nextPage);
        if (newMovies && newMovies.length > 0) {
          const uniqueNewMovies = newMovies.filter(nm => 
            !localMovies.some(lm => lm.imdbID === nm.imdbID)
          );
          setLocalMovies(prev => [...prev, ...uniqueNewMovies]);
          setPage(nextPage);
        }
      } catch (error) {
        console.error("Error fetching more movies:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!localMovies || localMovies.length === 0) return null;

  return (
    <section className="carousel-section">
      <h2 className="section-title">{title}</h2>
      <div className="carousel-container">
        <div className="carousel-scroll" ref={scrollRef} onScroll={handleScroll}>
          {localMovies.map((movie) => (
            <div key={movie.imdbID} className="carousel-item">
              <MovieCard 
                movie={movie} 
                onClick={() => onMovieSelect(movie)} 
                isSaved={watchlist && watchlist.some(m => m.imdbID === movie.imdbID)}
                onToggleSave={(e) => onToggleSave && onToggleSave(movie, e)}
              />
            </div>
          ))}
          {loading && <div className="carousel-loader">Loading...</div>}
        </div>
      </div>
    </section>
  );
};

export default Carousel;
