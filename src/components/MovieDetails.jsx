import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Download, Star, Clock, Heart, AlertCircle, Maximize, Minimize } from 'lucide-react';
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
  
  const [showGateway, setShowGateway] = useState(false);
  const [currentDownloadUrl, setCurrentDownloadUrl] = useState('');
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsAppFullscreen(!isAppFullscreen);
    try {
      if (!isAppFullscreen) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch(e) {
      console.log(e);
    }
  };

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

  // Removed local scraper logic to ensure stable ad-free iframe streaming

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
  // Using vidlink.pro as it is the most reliable ad-free player. Sandbox is removed as it blocks the player.
  const streamUrl = `https://vidlink.pro/${typeEndpoint}/${movie.imdbID}?primaryColor=5C67FA&secondaryColor=171E2D&iconColor=5C67FA&autoplay=false`;


  return (
    <div className="modal-overlay animate-fade-in">
      <div className="movie-details-modal">
        <button className="close-btn" onClick={onClose}>
          <ArrowLeft size={28} />
        </button>

        {loading ? (
          <div style={{padding: '50px', textAlign: 'center', color: 'white'}}>Loading details...</div>
        ) : details ? (
          <div className="movie-details-grid">
            
            <div className={`movie-poster-col ${isAppFullscreen ? 'app-fullscreen' : ''}`}>
              <button className="custom-fullscreen-btn" onClick={toggleFullscreen}>
                {isAppFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                <span style={{marginLeft: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Fullscreen</span>
              </button>
              <iframe 
                src={streamUrl}
                allowFullScreen={true}
                webkitallowfullscreen="true"
                mozallowfullscreen="true"
                allow="autoplay; fullscreen"
                frameBorder="0"
                className="stream-iframe"
              ></iframe>
            </div>
            
            <div className="movie-info-col">
              
              <div className="detail-actions">
                <button 
                  className={`btn ${isSaved ? 'btn-outline' : 'btn-primary'}`} 
                  onClick={onToggleSave}
                  style={{flex: 1, padding: '12px 10px', borderRadius: '30px'}}
                >
                  <Heart size={18} fill={isSaved ? "currentColor" : "none"} style={{marginRight: '8px'}}/> 
                  {isSaved ? 'Saved' : '+ Watchlist'}
                </button>

                <button 
                  className="btn btn-outline" 
                  onClick={handleDownload}
                  style={{flex: 1, padding: '12px 10px', borderRadius: '30px', borderColor: showSoonMsg ? '#f59e0b' : ''}}
                >
                  <Download size={18} style={{marginRight: '8px'}} />
                  {showSoonMsg ? 'Coming Soon' : 'Download'}
                </button>
              </div>

              <h2 className="detail-title">
                {details.Title} {movie.isHindiDubbed && '[Hindi]'}
              </h2>
              
              <div className="detail-meta">
                <span className="meta-item"><Star size={16} style={{color: '#f59e0b'}} /> {details.imdbRating}/10</span>
                <span>{details.Year}</span>
                <span style={{textTransform: 'capitalize'}}>{movie.Type}</span>
                <span className="meta-item"><Clock size={16} /> {details.Runtime}</span>
              </div>
              
              <div className="detail-genres">
                {details.Genre.split(',').join(' • ')}
              </div>
              
              <div className="detail-plot">
                <p>{details.Plot}</p>
              </div>

              <div className="section-title">Resources</div>
              <div>
                <span className="resource-pill">Audio Track: {movie.isHindiDubbed ? 'Hindi' : 'English / Original'}</span>
              </div>
              
              <div className="section-title">Cast</div>
              {details.ActorsFull && details.ActorsFull.length > 0 ? (
                <div className="cast-list no-scrollbar">
                  {details.ActorsFull.map(actor => (
                    <div key={actor.id} className="cast-card">
                      <div className="cast-avatar">
                        {actor.profile_path ? (
                          <img src={actor.profile_path} alt={actor.name} />
                        ) : (
                          <div style={{display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', fontSize: '24px'}}>{actor.name.charAt(0)}</div>
                        )}
                      </div>
                      <span className="cast-name">{actor.name}</span>
                      <span className="cast-character">{actor.character}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{color: 'var(--text-secondary)'}}>{details.Actors}</p>
              )}
            </div>
          </div>
        ) : (
          <div style={{padding: '50px', textAlign: 'center', color: '#ef4444'}}>Failed to load details.</div>
        )}

        {/* Similar Movies Section */}
        {!loading && similar.length > 0 && (
          <div className="similar-movies-section">
            <div className="section-title">More Like This</div>
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
