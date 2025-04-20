const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
    origin: 'https://mchandlermembership.netlify.app', // Replace with your actual Netlify URL
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

// Nodemailer setup (unchanged)
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL_USER, // Email address
        pass: process.env.EMAIL_PASS, // Email password
    },
});

// Your routes (unchanged)
app.post('/submit-form', (req, res) => {
    // Backend logic for form processing
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    res.status(200).json({ message: 'Form submitted successfully!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});