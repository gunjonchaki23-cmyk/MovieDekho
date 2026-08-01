import MovieCard from './MovieCard';
import './RecentReleases.css';

const RecentReleases = ({ movies, onMovieSelect }) => {
  if (movies.length === 0) {
    return <div className="recent-loading">Loading recent releases...</div>;
  }

  return (
    <div className="recent-section">
      <h2 className="section-title">Recent Releases</h2>
      <div className="recent-grid">
        {movies.map((movie) => (
          <MovieCard 
            key={movie.imdbID} 
            movie={movie} 
            onClick={() => onMovieSelect(movie)} 
          />
        ))}
      </div>
    </div>
  );
};

export default RecentReleases;
