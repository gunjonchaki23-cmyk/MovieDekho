import { useState, useEffect } from 'react';
import { Film, Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import './Header.css';

const Header = ({ currentView, setCurrentView, onSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-content">
        <a href="/" className="logo-link">
          <Film className="logo-icon" size={32} />
          <span className="logo-text">Movie<span className="text-accent">Dekho</span></span>
        </a>
        <nav className="nav-links">
          <button 
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${currentView === 'watchlist' ? 'active' : ''}`}
            onClick={() => setCurrentView('watchlist')}
          >
            Watchlist
          </button>
        </nav>
        
        <div className="header-right">
          <SearchBar onSearch={onSearch} isHeader={true} />
        </div>
      </div>
    </header>
  );
};

export default Header;
