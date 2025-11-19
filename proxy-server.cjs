// A simple Express server to act as a CORS proxy
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001; // Port for the proxy server

// Enable CORS for all routes
// This will allow your React app (running on a different port) to make requests to this server.
app.use(cors());

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios.get(targetUrl, {
            // It's good practice to forward some basic headers to make the request look more like a real browser
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching the URL:', error.message);
        // Send back a more specific error status if available
        if (error.response) {
            res.status(error.response.status).send(error.message);
        } else {
            res.status(500).send('Error fetching the URL');
        }
    }
});

app.listen(port, () => {
    console.log(`CORS proxy server listening at http://localhost:${port}`);
});
