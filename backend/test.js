const { MOVIES } = require('@consumet/extensions');
const flixhq = new MOVIES.FlixHQ();

async function test() {
    try {
        console.log("Searching for Inception...");
        const res = await flixhq.search("Inception");
        if (res.results.length === 0) {
            console.log("No results");
            return;
        }
        const mediaId = res.results[0].id;
        console.log("Found Media ID:", mediaId);
        
        const mediaInfo = await flixhq.fetchMediaInfo(mediaId);
        console.log("Media Info:", mediaInfo.title);
        
        if (mediaInfo.episodes.length > 0) {
            const episodeId = mediaInfo.episodes[0].id;
            console.log("Fetching sources for episode ID:", episodeId);
            const sources = await flixhq.fetchEpisodeSources(episodeId, mediaId);
            console.log("Sources:", JSON.stringify(sources, null, 2));
        } else {
            console.log("No episodes found.");
        }
    } catch(e) {
        console.error(e);
    }
}
test();
