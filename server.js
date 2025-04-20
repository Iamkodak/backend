const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
    origin: 'https://mchandlermembership.netlify.app', // Replace with your Netlify URL
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type'], // Allow necessary headers
}));

// Handle preflight (OPTIONS) requests for all routes
app.options('*', cors()); // This explicitly handles preflight requests

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'outlook', // Update if using a different email service
    auth: {
        user: process.env.EMAIL_USER, // Sender email from environment variable
        pass: process.env.EMAIL_PASS, // Sender password from environment variable
    },
});

// Root route (GET /) for testing backend
app.get('/', (req, res) => {
    res.send('Welcome to the Mike Chandler Management Backend API!');
});

// POST /submit-form endpoint
app.post('/submit-form', (req, res) => {
    const {
        fullname, email, dob, address, city, state, zip,
        phone, emergencyName, emergencyRelationship, emergencyPhoneNumber,
        membershipType, preferredEvent, tshirt, hear, condition,
    } = req.body;

    // Validate required fields
    if (!fullname || !email) {
        return res.status(400).json({ error: 'Full Name and Email are required fields.' });
    }

    // Log form data for debugging
    console.log('Form data received:', req.body);

    // Send confirmation email
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email address
        to: email, // Recipient email address
        subject: 'Membership Application Confirmation',
        text: `
            Hello ${fullname},

            Thank you for applying for membership with Mike Chandler Management. Your application has been received and is being reviewed. We'll follow up shortly.

            Best regards,
            Mike Chandler Management
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send confirmation email.' });
        }

        console.log('Email sent successfully:', info.response);
        res.status(200).json({ message: 'Form submitted successfully! Confirmation email sent.' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});