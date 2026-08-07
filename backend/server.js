const express = require('express');
const cors = require('cors');
const { MOVIES } = require('@consumet/extensions');

const app = express();
app.use(cors());

// You can swap FlixHQ with Goku or others if one goes down
const provider = new MOVIES.FlixHQ();

app.get('/api/stream', async (req, res) => {
    const { id, title } = req.query;
    
    if (!title) {
        return res.status(400).json({ error: "Movie title is required for searching" });
    }

    try {
        console.log(`[+] Searching for: ${title}`);
        const searchRes = await provider.search(title);
        
        if (searchRes.results.length === 0) {
            return res.status(404).json({ error: "Movie not found in provider" });
        }

        // Usually the first result is the best match
        const mediaId = searchRes.results[0].id;
        console.log(`[+] Found Media ID: ${mediaId}`);
        
        const mediaInfo = await provider.fetchMediaInfo(mediaId);
        
        if (!mediaInfo.episodes || mediaInfo.episodes.length === 0) {
            return res.status(404).json({ error: "No streamable episodes found" });
        }

        const episodeId = mediaInfo.episodes[0].id;
        console.log(`[+] Fetching sources for Episode ID: ${episodeId}`);
        
        const sources = await provider.fetchEpisodeSources(episodeId, mediaId);
        
        // Find the best quality or auto m3u8
        let directUrl = null;
        if (sources.sources && sources.sources.length > 0) {
            const autoSource = sources.sources.find(s => s.quality === 'auto' || s.url.includes('.m3u8'));
            directUrl = autoSource ? autoSource.url : sources.sources[0].url;
        }

        if (directUrl) {
            res.json({ success: true, url: directUrl });
        } else {
            res.status(404).json({ error: "Direct URL extraction failed" });
        }

    } catch (error) {
        console.error("[-] Scraper Error:", error.message);
        // Error 522 means Cloudflare blocked the scraper.
        res.status(500).json({ 
            error: "Failed to scrape.", 
            details: error.message,
            isBlocked: error.message.includes('522') || error.message.includes('403')
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Scraper API is running on http://localhost:${PORT}`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/stream?title=Inception`);
});
