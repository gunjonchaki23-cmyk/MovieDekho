import { Heart } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie, onClick, isSaved, onToggleSave }) => {
  const posterUrl = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster";

  return (
    <div className="movie-card" onClick={onClick}>
      <div className="card-image-wrapper">
        <img src={posterUrl} alt={movie.Title} className="card-image" loading="lazy" />
        
        {movie.isHindiDubbed && (
          <div className="badge-hindi-dub">
            Hindi
          </div>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title" title={movie.Title}>{movie.Title}</h3>
        <div className="card-meta">
          <span className="card-year">{movie.Year}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
