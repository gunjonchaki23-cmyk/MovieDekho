import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvAmZ0RLeLOj0X9JFqea4a3ExekB0dtD5iBCb-XWD3jFQpGsxBMQ_xlqm_ttoHvJAXoR6yD8SPfXcx/pub?output=csv';

let cachedLinks = null;

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
          results.data.forEach(row => {
            const id = row['TMDB ID'];
            const link = row['Google Drive Link'];
            if (id && link && link.trim() !== '') {
              links[id.toString()] = link.trim();
            }
          });
          cachedLinks = links;
          resolve(links);
        }
      });
    });
  } catch (err) {
    console.error("Error fetching download links from Google Sheets:", err);
    return {};
  }
};

export const getDownloadLink = async (imdbID) => {
  const ObjectLinks = await fetchDownloadLinks();
  return ObjectLinks[imdbID];
};
