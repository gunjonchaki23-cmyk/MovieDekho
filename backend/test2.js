const { MOVIES } = require('@consumet/extensions');

async function testProvider(ProviderClass, name) {
    try {
        console.log(`\n--- Testing ${name} ---`);
        const provider = new ProviderClass();
        const res = await provider.search("Inception");
        if (res.results.length === 0) {
            console.log("No results");
            return;
        }
        const mediaId = res.results[0].id;
        console.log("Found Media ID:", mediaId);
        
        const mediaInfo = await provider.fetchMediaInfo(mediaId);
        
        if (mediaInfo.episodes && mediaInfo.episodes.length > 0) {
            const episodeId = mediaInfo.episodes[0].id;
            console.log("Fetching sources for episode ID:", episodeId);
            const sources = await provider.fetchEpisodeSources(episodeId, mediaId);
            console.log("Sources:", sources.sources ? "Success" : "Failed");
        } else {
            console.log("No episodes found.");
        }
    } catch(e) {
        console.error("Error:", e.message);
    }
}

async function testAll() {
    await testProvider(MOVIES.Goku, "Goku");
    await testProvider(MOVIES.MovieHdWatch, "MovieHdWatch");
    // ZoeChip was removed or is similar
}
testAll();
