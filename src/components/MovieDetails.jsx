import { useState, useEffect } from 'react';
import { X, Play, Download, Star, Clock, Calendar, Heart, AlertCircle, Tv, Server } from 'lucide-react';
import { getMovieDetails, getSimilarMovies } from '../services/api';
import { getDownloadLink } from '../services/downloadLinks';
import MovieCard from './MovieCard';
import DownloadGateway from './DownloadGateway';
import CustomPlayer from './CustomPlayer';
import './MovieDetails.css';

const MovieDetails = ({ movie, onClose, isSaved, onToggleSave, onSimilarSelect }) => {
  const [details, setDetails] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSoonMsg, setShowSoonMsg] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [activeServer, setActiveServer] = useState('native');
  const [showGateway, setShowGateway] = useState(false);
  const [currentDownloadUrl, setCurrentDownloadUrl] = useState('');
  const [directStreamUrl, setDirectStreamUrl] = useState(null);
  const [streamError, setStreamError] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getMovieDetails(movie.imdbID, movie.Type);
      setDetails(data);
      setLoading(false);
      
      const url = await getDownloadLink(movie.imdbID, movie.Type);
      setCurrentDownloadUrl(url);
      
      const similarData = await getSimilarMovies(movie.imdbID);
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

  useEffect(() => {
    if (showStream && activeServer === 'native') {
      // Mocking direct stream extraction. In production, this needs a backend scraper API.
      // Since public streaming sites block direct .m3u8 extraction via CORS/tokens,
      // we gracefully fallback or show a message if extraction fails.
      setDirectStreamUrl(null);
      setStreamError(true);
      
      // If we had a reliable API, it would be:
      // fetch(`https://api.example.com/stream/${movie.imdbID}`).then(...).then(url => setDirectStreamUrl(url))
    }
  }, [showStream, activeServer, movie.imdbID]);

  const handleDownload = async () => {
    const link = await getDownloadLink(movie.imdbID, movie.Type);
    if (link) {
      setCurrentDownloadUrl(link);
      setShowGateway(true);
    } else {
      setShowSoonMsg(true);
      setTimeout(() => setShowSoonMsg(false), 3000);
    }
  };

  const typeEndpoint = movie.Type === 'series' ? 'tv' : 'movie';
  
  const getServerUrl = () => {
    if (activeServer === 'server1') {
      return `https://vidlink.pro/${typeEndpoint}/${movie.imdbID}?primaryColor=e50914&secondaryColor=141414&iconColor=e50914`;
    } else if (activeServer === 'server2') {
      return `https://vidsrc.pm/embed/${typeEndpoint}/${movie.imdbID}`;
    } else {
      return `https://player.autoembed.cc/embed/${typeEndpoint}/${movie.imdbID}`;
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
                <button className="btn btn-primary action-btn stream-btn" onClick={() => setShowStream(true)}>
                  <Play size={20} fill="currentColor" /> Stream Full Movie
                </button>
                <button className="btn btn-outline action-btn" onClick={handleWatch}>
                  <Tv size={20} /> Trailer
                </button>
                <button 
                  className={`btn action-btn ${showSoonMsg ? 'btn-soon' : 'btn-outline'}`} 
                  onClick={handleDownload}
                >
                  {showSoonMsg ? (
                    <><AlertCircle size={20} /> শীঘ্রই সংযুক্ত হবে</>
                  ) : (
                    <><Download size={20} /> Direct Drive</>
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

      {/* Multi-Server Player Modal */}
      {showStream && (
        <div className="stream-modal-overlay" onClick={() => setShowStream(false)}>
          <div className="stream-modal-content" onClick={e => e.stopPropagation()}>
            <div className="stream-header-bar">
              <div className="server-tabs">
                <span className="server-label"><Server size={16} /> Server:</span>
                <button 
                  className={`server-tab ${activeServer === 'native' ? 'active' : ''}`}
                  onClick={() => setActiveServer('native')}
                >
                  Native Player (Ad-Free)
                </button>
                <button 
                  className={`server-tab ${activeServer === 'server1' ? 'active' : ''}`}
                  onClick={() => setActiveServer('server1')}
                >
                  Server 1 (VidLink Pro)
                </button>
                <button 
                  className={`server-tab ${activeServer === 'server2' ? 'active' : ''}`}
                  onClick={() => setActiveServer('server2')}
                >
                  Server 2 (Vidsrc Pro)
                </button>
                <button 
                  className={`server-tab ${activeServer === 'server3' ? 'active' : ''}`}
                  onClick={() => setActiveServer('server3')}
                >
                  Server 3 (AutoEmbed)
                </button>
              </div>
              <button className="close-stream-btn" onClick={() => setShowStream(false)}>
                <X size={24} />
              </button>
            </div>
            
            {activeServer === 'native' ? (
              <div className="native-player-wrapper" style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff'}}>
                {directStreamUrl ? (
                   <CustomPlayer src={directStreamUrl} />
                ) : (
                   <div style={{textAlign: 'center', padding: '2rem'}}>
                     <AlertCircle size={48} style={{margin: '0 auto 1rem', color: '#e50914'}} />
                     <h3>Direct Stream Unavailable</h3>
                     <p style={{color: '#aaa', marginTop: '0.5rem'}}>
                       Anti-bot protection prevented direct `.m3u8` extraction for this movie.
                       Please switch to Server 1, 2, or 3 to watch via standard iframe.
                     </p>
                     <button 
                        className="btn btn-primary" 
                        style={{marginTop: '1.5rem'}}
                        onClick={() => setActiveServer('server1')}
                      >
                       Switch to Server 1
                     </button>
                   </div>
                )}
              </div>
            ) : (
              <iframe 
                src={getServerUrl()}
                allowFullScreen
                frameBorder="0"
                className="stream-iframe"
              ></iframe>
            )}
          </div>
        </div>
      )}

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
