import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import SearchBar from './SearchBar';
import './Header.css';

const Header = ({ activeCategory, setActiveCategory, onSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const categories = ['All', 'Movies', 'TV Shows', 'Animations', 'Live Tv'];

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
      <div className="container header-top">
        <a href="/" className="logo-link">
          <span className="logo-text"><span className="text-accent">N</span>etMovie</span>
        </a>
        <div className="header-right">
          <SearchBar onSearch={onSearch} isHeader={true} />
          <Settings className="settings-icon" size={24} style={{marginLeft: '15px'}} />
        </div>
      </div>
      
      <div className="category-pills-container">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;
