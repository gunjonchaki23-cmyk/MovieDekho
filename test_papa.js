import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvAmZ0RLeLOj0X9JFqea4a3ExekB0dtD5iBCb-XWD3jFQpGsxBMQ_xlqm_ttoHvJAXoR6yD8SPfXcx/pub?output=csv';

async function testFetch() {
  const response = await fetch(CSV_URL, { cache: 'no-store' });
  const csvText = await response.text();
  
  Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      console.log('Headers:', results.meta.fields);
      const links = {};
      results.data.forEach(row => {
        const id = row['TMDB ID'];
        const link = row['Google Drive Link'];
        if (id && link && link.trim() !== '') {
          links[id.toString()] = link.trim();
        }
      });
      console.log('Parsed Links:', links);
      console.log('Article 370 link:', links['1233531']);
    }
  });
}

testFetch();
