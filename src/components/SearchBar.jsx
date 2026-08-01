import { useState, useEffect, useRef } from 'react';
import { Search, Loader, X, Film } from 'lucide-react';
import { searchMovies } from '../services/api';
import './SearchBar.css';

const SearchBar = ({ onSearch, loading, isHeader }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isHeader);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
        if (isHeader) setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHeader]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchMovies(query, 1);
      if (results.Search) {
        setSuggestions(results.Search.slice(0, 5));
        setShowDropdown(true);
      }
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query);
    }
  };

  const handleSuggestionClick = (movie) => {
    setQuery(movie.Title);
    setShowDropdown(false);
    onSearch(movie.Title);
  };
  
  const toggleSearch = () => {
    if (isHeader) {
      if (isExpanded && query) {
        setQuery('');
        onSearch('');
      }
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`search-container ${isHeader ? 'header-search' : ''} ${isExpanded ? 'expanded' : ''}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <button type="button" className="search-icon-btn" onClick={toggleSearch}>
          <Search className="search-icon" size={isHeader ? 20 : 24} />
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="Titles, people, genres"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (isHeader && !isExpanded) setIsExpanded(true);
            if (query.trim()) setShowDropdown(true);
          }}
        />
        {(loading || isLoading) && (
          <Loader className="search-spinner" size={20} />
        )}
        {query && isHeader && isExpanded && (
          <button type="button" className="clear-search-btn" onClick={() => {
            setQuery('');
            onSearch('');
          }}>
            <X size={16} />
          </button>
        )}
      </form>
      
      {showDropdown && suggestions.length > 0 && (
        <div className="suggestions-dropdown glass-panel">
          {suggestions.map(movie => (
            <div 
              key={movie.imdbID} 
              className="suggestion-item"
              onClick={() => handleSuggestionClick(movie)}
            >
              {movie.Poster !== "N/A" ? (
                <img src={movie.Poster} alt="" className="suggestion-poster" />
              ) : (
                <div className="suggestion-poster-placeholder"><Film size={16}/></div>
              )}
              <div className="suggestion-info">
                <span className="suggestion-title">{movie.Title}</span>
                <span className="suggestion-year">{movie.Year}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
