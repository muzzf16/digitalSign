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
            console.error('❌ Error reading database file:', err);
            return res.status(500).json({ error: 'Error reading database' });
        }
        console.log('✅ GET /api/data - Database loaded successfully');
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// POST /api/data - Overwrites db.json with the request body
app.post('/api/data', (req, res) => {
    const newData = req.body;
    if (!newData) {
        console.log('⚠️  POST /api/data - No data provided');
        return res.status(400).json({ error: 'No data provided' });
    }

    fs.writeFile(DB_PATH, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('❌ Error writing to database file:', err);
            return res.status(500).json({ error: 'Error writing to database' });
        }
        console.log('💾 POST /api/data - Database saved successfully');
        res.status(200).json({ message: 'Data saved successfully' });
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
app.get(/^\/(?!api|proxy).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║        BPR Digital Signage - API Server Started! 🚀           ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log(`║  Local:    http://localhost:${port}                             ║`);
    console.log(`║  API:      http://localhost:${port}/api/data                    ║`);
    console.log(`║  Proxy:    http://localhost:${port}/proxy?url=...              ║`);
    console.log('║                                                                ║');
    console.log('║  Database: db.json                                             ║');
    console.log('║  Status:   ✅ Ready to accept connections                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log('💡 Tip: Run "npm run dev:all" to start both API and Vite server\n');
});
