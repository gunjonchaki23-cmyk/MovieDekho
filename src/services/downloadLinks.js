import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvAmZ0RLeLOj0X9JFqea4a3ExekB0dtD5iBCb-XWD3jFQpGsxBMQ_xlqm_ttoHvJAXoR6yD8SPfXcx/pub?output=csv';

let cachedLinks = null;
let cachedIdsList = null;

export const fetchDownloadLinks = async () => {
  if (cachedLinks) return cachedLinks;

  try {
    const response = await fetch(CSV_URL, { cache: 'no-store' });
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const links = {};
          const itemsList = [];
          results.data.forEach(row => {
            const id = row['TMDB ID'];
            const link = row['Google Drive Link'];
            const rawType = row['Type'] || '';
            const type = rawType.toLowerCase().includes('tv') ? 'tv' : 'movie';
            
            if (id && link && link.trim() !== '') {
              const strId = id.toString();
              links[`${type}_${strId}`] = link.trim(); // Prevent collision between movie and tv IDs
              if (!links[strId]) links[strId] = link.trim(); // Fallback
              
              if (!itemsList.find(i => i.id === strId && i.type === type)) {
                itemsList.push({ id: strId, type });
              }
            }
          });
          cachedLinks = links;
          cachedIdsList = itemsList;
          resolve(links);
        }
      });
    });
  } catch (err) {
    console.error("Error fetching download links from Google Sheets:", err);
    return {};
  }
};

export const fetchAvailableMoviesList = async () => {
  if (!cachedIdsList) {
    await fetchDownloadLinks();
  }
  return cachedIdsList || [];
};

export const getDownloadLink = async (imdbID, type = 'movie') => {
  const ObjectLinks = await fetchDownloadLinks();
  const tmdbType = type === 'series' ? 'tv' : 'movie';
  return ObjectLinks[`${tmdbType}_${imdbID}`] || ObjectLinks[imdbID];
};
