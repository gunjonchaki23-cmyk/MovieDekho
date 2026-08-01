import { useState, useEffect } from 'react';
import { Play, Info } from 'lucide-react';
import './Billboard.css';

const Billboard = ({ movies, onPlay, onMoreInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000); // Change every 6 seconds
    
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  const backgroundUrl = movie.Backdrop && movie.Backdrop !== "N/A" 
    ? movie.Backdrop 
    : (movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/1920x1080?text=No+Image");

  return (
    <div className="billboard-container">
      {movies.map((m, index) => (
        <div 
          key={m.imdbID}
          className={`billboard-background ${index === currentIndex ? 'active' : ''}`}
          style={{ 
            backgroundImage: `url(${m.Backdrop && m.Backdrop !== "N/A" ? m.Backdrop : (m.Poster !== "N/A" ? m.Poster : "")})` 
          }}
        >
          <div className="billboard-vignette-top"></div>
          <div className="billboard-vignette-bottom"></div>
          <div className="billboard-vignette-left"></div>
        </div>
      ))}
      
      <div className="billboard-content">
        <h1 className="billboard-title animate-title" key={movie.Title}>{movie.Title}</h1>
        
        <div className="billboard-meta animate-meta" key={movie.imdbID}>
          <span className="meta-year">{movie.Year}</span>
          <span className="meta-type">{movie.Type?.toUpperCase()}</span>
        </div>
        
        <p className="billboard-synopsis animate-synopsis" key={movie.Plot}>
          {movie.Plot && movie.Plot !== "N/A" 
            ? movie.Plot.substring(0, 200) + '...' 
            : "No description available for this title."}
        </p>
        
        <div className="billboard-actions">
          <button className="btn btn-primary btn-play" onClick={() => onPlay(movie)}>
            <Play size={24} fill="currentColor" /> Play
          </button>
          <button className="btn btn-outline btn-more-info" onClick={() => onMoreInfo(movie)}>
            <Info size={24} /> More Info
          </button>
        </div>
        
        {movies.length > 1 && (
          <div className="billboard-indicators">
            {movies.map((_, idx) => (
              <span 
                key={idx} 
                className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              ></span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billboard;
