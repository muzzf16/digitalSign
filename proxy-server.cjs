// A simple Express server to act as a CORS proxy and data store
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001; // Port for the proxy server
const DB_PATH = path.resolve(__dirname, 'db.json');

// Enable CORS for all routes
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' })); // Increase limit to handle base64 images

// --- Data Persistence API ---

// GET /api/data - Reads the entire db.json and returns it
app.get('/api/data', (req, res) => {
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading database file:', err);
            return res.status(500).send('Error reading database');
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// POST /api/data - Overwrites db.json with the request body
app.post('/api/data', (req, res) => {
    const newData = req.body;
    if (!newData) {
        return res.status(400).send('No data provided');
    }

    fs.writeFile(DB_PATH, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to database file:', err);
            return res.status(500).send('Error writing to database');
        }
        res.status(200).send('Data saved successfully');
    });
});


// --- CORS Proxy for Scraping ---

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching the URL:', error.message);
        if (error.response) {
            res.status(error.response.status).send(error.message);
        } else {
            res.status(500).send('Error fetching the URL');
        }
    }
});

// --- Serve Static Files (Production) ---
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - return index.html for all non-API routes
app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/proxy')) {
        return res.status(404).send('Not found');
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Proxy and API server listening at http://localhost:${port}`);
});
