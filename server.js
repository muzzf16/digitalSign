const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS for the frontend
app.use(cors());

// Generic Proxy Endpoint
app.get('/proxy', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('Missing "url" query parameter');
    }

    try {
        // Native fetch is available in Node.js 18+. 
        // We add a User-Agent to look like a real browser and avoid being blocked.
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`External site returned status: ${response.status}`);
        }

        const text = await response.text();
        res.send(text);

    } catch (error) {
        console.error(`Proxy error for ${url}:`, error.message);
        res.status(500).send(`Error fetching data: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`---------------------------------------------------`);
    console.log(`✅ Local Proxy Server running on http://localhost:${PORT}`);
    console.log(`   Ready to fetch external data for BPR App`);
    console.log(`---------------------------------------------------`);
});