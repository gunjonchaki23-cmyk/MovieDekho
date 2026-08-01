import { Film, RefreshCw } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({ query }) => {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-icon-wrapper">
        <Film size={48} className="empty-icon" />
      </div>
      <h2 className="empty-title">No Movies Found</h2>
      <p className="empty-subtitle">
        We couldn't find any movies matching "{query}". 
      </p>
      <div className="empty-action">
        <p className="update-msg text-accent">We will update soon!</p>
      </div>
    </div>
  );
};

export default EmptyState;
