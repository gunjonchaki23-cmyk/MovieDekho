import { useState, useEffect } from 'react';
import { X, Play, Download, Star, Clock, Calendar, Heart, AlertCircle } from 'lucide-react';
import { getMovieDetails, getSimilarMovies } from '../services/api';
import { getDownloadLink } from '../services/downloadLinks';
import MovieCard from './MovieCard';
import DownloadGateway from './DownloadGateway';
import './MovieDetails.css';

const MovieDetails = ({ movie, onClose, isSaved, onToggleSave, onSimilarSelect }) => {
  const [details, setDetails] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSoonMsg, setShowSoonMsg] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [currentDownloadUrl, setCurrentDownloadUrl] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getMovieDetails(movie.imdbID);
      setDetails(data);
      setLoading(false);
      
      // Fetch similar movies as well in background
      const similarData = await getSimilarMovies(movie.imdbID);
      // Filter out the current movie just in case
      setSimilar(similarData.filter(m => m.imdbID !== movie.imdbID));
    };
    
    fetchDetails();
  }, [movie.imdbID]);

  const handleWatch = () => {
    if (details?.TrailerKey) {
      setShowTrailer(true);
    } else {
      window.open(`https://www.youtube.com/results?search_query=${movie.Title}+trailer`, '_blank');
    }
  };

  const handleDownload = async () => {
    const link = await getDownloadLink(movie.imdbID);
    if (link) {
      setCurrentDownloadUrl(link);
      setShowGateway(true);
    } else {
      setShowSoonMsg(true);
      setTimeout(() => setShowSoonMsg(false), 3000); // Reset after 3 seconds
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      {details && details.Poster !== "N/A" && (
        <div 
          className="modal-bg-image" 
          style={{ backgroundImage: `url(${details.Poster})` }} 
        />
      )}
      <div className="movie-details-modal glass-panel" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {loading ? (
          <div className="modal-loader">Loading details...</div>
        ) : details ? (
          <div className="movie-details-grid">
            <div className="movie-poster-col">
              {showTrailer ? (
                <div className="trailer-container">
                  <iframe 
                    src={`https://www.youtube.com/embed/${details.TrailerKey}?autoplay=1`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="trailer-iframe"
                  ></iframe>
                </div>
              ) : (
                <img 
                  src={details.Poster !== "N/A" ? details.Poster : "https://via.placeholder.com/300x450?text=No+Poster"} 
                  alt={details.Title} 
                  className="detail-poster" 
                />
              )}
            </div>
            
            <div className="movie-info-col">
              <h2 className="detail-title">{details.Title}</h2>
              
              <div className="detail-meta">
                <span className="meta-item"><Star size={16} className="text-accent" /> {details.imdbRating}</span>
                <span className="meta-item"><Calendar size={16} /> {details.Year}</span>
                <span className="meta-item"><Clock size={16} /> {details.Runtime}</span>
                <span className="meta-badge">{details.Rated}</span>
                {movie.isHindiDubbed && (
                  <span className="meta-badge" style={{ backgroundColor: 'rgba(229, 9, 20, 0.9)', color: 'white' }}>
                    Hindi Dub
                  </span>
                )}
              </div>
              
              <div className="detail-genres">
                {details.Genre.split(',').map((genre, i) => (
                  <span key={i} className="genre-tag">{genre.trim()}</span>
                ))}
              </div>
              
              <div className="detail-plot">
                <h3>Plot</h3>
                <p>{details.Plot}</p>
              </div>
              
              <div className="detail-cast">
                <h3>Cast</h3>
                {details.ActorsFull && details.ActorsFull.length > 0 ? (
                  <div className="cast-list no-scrollbar">
                    {details.ActorsFull.map(actor => (
                      <div key={actor.id} className="cast-card">
                        <div className="cast-avatar">
                          {actor.profile_path ? (
                            <img src={actor.profile_path} alt={actor.name} />
                          ) : (
                            <div className="cast-avatar-placeholder">{actor.name.charAt(0)}</div>
                          )}
                        </div>
                        <span className="cast-name">{actor.name}</span>
                        <span className="cast-character">{actor.character}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>{details.Actors}</p>
                )}
              </div>

              <div className="detail-actions">
                <button className="btn btn-primary action-btn" onClick={handleWatch}>
                  <Play size={20} /> {details.TrailerKey && showTrailer ? "Playing Trailer" : (details.TrailerKey ? "Watch Trailer" : "Watch Now")}
                </button>
                <button 
                  className={`btn action-btn ${showSoonMsg ? 'btn-soon' : 'btn-outline'}`} 
                  onClick={handleDownload}
                >
                  {showSoonMsg ? (
                    <><AlertCircle size={20} /> শীঘ্রই সংযুক্ত হবে</>
                  ) : (
                    <><Download size={20} /> Download</>
                  )}
                </button>
                <button 
                  className={`btn btn-outline action-btn save-action-btn ${isSaved ? 'saved' : ''}`} 
                  onClick={onToggleSave}
                >
                  <Heart size={20} fill={isSaved ? "currentColor" : "none"} /> 
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              {details.Ratings && details.Ratings.length > 0 && (
                <div className="ratings-breakdown">
                  <h3>Ratings</h3>
                  <div className="ratings-list">
                    {details.Ratings.map((rating, idx) => (
                      <div key={idx} className="rating-badge">
                        <span className="rating-source">{rating.Source}</span>
                        <span className="rating-value">{rating.Value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="modal-error">Failed to load details.</div>
        )}

        {/* Similar Movies Section */}
        {!loading && similar.length > 0 && (
          <div className="similar-movies-section">
            <h3>You might also like</h3>
            <div className="similar-movies-scroll no-scrollbar">
              {similar.map(simMovie => (
                <div key={simMovie.imdbID} className="similar-movie-item">
                  <MovieCard 
                    movie={simMovie} 
                    onClick={() => onSimilarSelect(simMovie)} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showGateway && (
        <DownloadGateway 
          downloadUrl={currentDownloadUrl}
          directAdUrl="https://publishedelegance.com/k5q92rhdp?key=57570aa910e207f95d310978fcb9008d"
          onComplete={() => setShowGateway(false)}
        />
      )}
    </div>
  );
};

export default MovieDetails;
