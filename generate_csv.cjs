const API_KEY = '92b418e837b833be308bbfb1fb2aca1e';

async function generateCSV() {
  try {
    const r1 = await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key='+API_KEY);
    const movies = await r1.json();
    
    const r2 = await fetch('https://api.themoviedb.org/3/trending/tv/day?api_key='+API_KEY);
    const tvs = await r2.json();

    let csv = 'TMDB ID,Type,Title,Google Drive Link\n';
    
    // Add existing ones first
    csv += '415358,Movie,Pink,https://drive.google.com/file/d/1SPqaTX5CJRjxSpnmTr2qbuhiXhAIb2Ej/view?usp=drive_link\n';
    csv += '1081003,Movie,Supergirl,https://drive.google.com/file/d/1Ds2iMRB16amTjx__xAy-yUh651Ht8Cma/view?usp=drive_link\n';
    csv += '1368337,Movie,The Odyssey,https://drive.google.com/file/d/1Kz0K-08yzeH0UUUnelE_tM-_v1BeOXUG/view?usp=drive_link\n';

    movies.results.slice(0, 20).forEach(m => {
      // Don't duplicate the ones we already hardcoded
      if (![415358, 1081003, 1368337].includes(m.id)) {
        csv += `${m.id},Movie,"${m.title}",\n`;
      }
    });

    tvs.results.slice(0, 10).forEach(t => {
      csv += `${t.id},TV Show,"${t.name}",\n`;
    });

    require('fs').writeFileSync('trending_list.csv', csv);
    console.log('Generated trending_list.csv');
  } catch (err) {
    console.error(err);
  }
}

generateCSV();
