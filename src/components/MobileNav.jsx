import { Home, Flame, Search, Heart } from 'lucide-react';
import './MobileNav.css';

const MobileNav = ({ activeTab, onTabChange, savedCount }) => {
  return (
    <div className="mobile-bottom-nav">
      <button 
        className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'trending' ? 'active' : ''}`}
        onClick={() => onTabChange('trending')}
      >
        <Flame size={22} />
        <span>Trending</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onTabChange('search')}
      >
        <Search size={22} />
        <span>Search</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'watchlist' ? 'active' : ''}`}
        onClick={() => onTabChange('watchlist')}
      >
        <div className="nav-icon-wrapper">
          <Heart size={22} />
          {savedCount > 0 && <span className="saved-badge">{savedCount}</span>}
        </div>
        <span>My List</span>
      </button>
    </div>
  );
};

export default MobileNav;
