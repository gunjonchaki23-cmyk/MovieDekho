import './GenreFilter.css';

const genres = ['Action', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Drama', 'Animation', 'Fantasy', 'Mystery'];

const GenreFilter = ({ activeGenre, onGenreSelect }) => {
  return (
    <div className="genre-filter animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="genre-list no-scrollbar">
        {genres.map(genre => (
          <button
            key={genre}
            className={`genre-btn ${activeGenre === genre ? 'active' : ''}`}
            onClick={() => onGenreSelect(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter;
