import { Heart } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie, onClick, isSaved, onToggleSave }) => {
  const posterUrl = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster";

  return (
    <div className="movie-card glass-panel" onClick={onClick}>
      <div className="card-image-wrapper">
        <img src={posterUrl} alt={movie.Title} className="card-image" loading="lazy" />
        <button 
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleSave) onToggleSave(e);
          }}
        >
          <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
        </button>
        <div className="card-overlay">
          <span className="btn btn-primary">View Details</span>
        </div>
        {movie.isHindiDubbed && (
          <div className="badge-hindi-dub">
            Hindi Dub
          </div>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title" title={movie.Title}>{movie.Title}</h3>
        <div className="card-meta">
          <span className="card-year">{movie.Year}</span>
          <span className="card-type">{movie.Type}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
