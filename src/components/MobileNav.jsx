import { Home, Search, Download, User } from 'lucide-react';
import './MobileNav.css';

const MobileNav = ({ activeTab, onTabChange, savedCount }) => {
  return (
    <div className="mobile-bottom-nav">
      <button 
        className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <Home size={24} />
        <span>Home</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => onTabChange('search')}
      >
        <Search size={24} />
        <span>Search</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'downloads' ? 'active' : ''}`}
        onClick={() => onTabChange('downloads')}
      >
        <div className="nav-icon-wrapper">
          <Download size={24} />
          {savedCount > 0 && <span className="saved-badge">{savedCount}</span>}
        </div>
        <span>Downloads</span>
      </button>

      <button 
        className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <User size={24} />
        <span>Profile</span>
      </button>
    </div>
  );
};

export default MobileNav;
