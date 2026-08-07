const { MOVIES } = require('@consumet/extensions');

async function testProvider(ProviderClass, name) {
    try {
        console.log(`\n--- Testing ${name} ---`);
        const provider = new ProviderClass();
        
        console.log(`Searching for Inception on ${name}...`);
        const res = await provider.search('Inception');
        
        if (res.results && res.results.length > 0) {
            const firstId = res.results[0].id;
            console.log(`Found ID: ${firstId}. Fetching media info...`);
            
            const info = await provider.fetchMediaInfo(firstId);
            
            if (info.episodes && info.episodes.length > 0) {
                const episodeId = info.episodes[0].id;
                console.log(`Found Episode ID: ${episodeId}. Fetching stream...`);
                
                const stream = await provider.fetchEpisodeSources(episodeId, firstId);
                console.log(`Success! Stream URL:`, stream.sources[0]?.url);
            } else {
                console.log('No episodes found.');
            }
        } else {
            console.log('Search returned no results.');
        }
    } catch (e) {
        console.log(`Error with ${name}: ${e.message}`);
    }
}

async function runTests() {
    await testProvider(MOVIES.SFlix, 'SFlix');
    await testProvider(MOVIES.HiMovies, 'HiMovies');
}

runTests();
