const fetch = require('node-fetch'); // wait, node >= 18 has fetch built-in.
const API_KEY = '92b418e837b833be308bbfb1fb2aca1e';
const BASE_URL = 'https://api.themoviedb.org/3';

async function fetchCategory(name, url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const titles = data.results.slice(0, 10).map(m => m.title || m.name);
    console.log(`\n--- ${name} ---`);
    titles.forEach((t, i) => console.log(`${i + 1}. ${t}`));
  } catch (err) {
    console.error(`Error fetching ${name}:`, err);
  }
}

async function main() {
  await fetchCategory('Trending Movies', `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&page=1`);
  await fetchCategory('Popular TV Shows', `${BASE_URL}/trending/tv/day?api_key=${API_KEY}&page=1`);
  await fetchCategory('New Releases', `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=1`);
  await fetchCategory('Bollywood Blockbusters', `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=1`);
  await fetchCategory('Hollywood Hits', `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=en&sort_by=popularity.desc&page=1`);
  await fetchCategory('Korean Dramas (Hindi Dubbed)', `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ko&with_spoken_languages=hi&sort_by=popularity.desc&page=1`);
}

main();
