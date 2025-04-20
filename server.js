const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS configuration: Allow only the specified Netlify frontend origin
app.use(cors({
    origin: 'https://mchandlermembership.netlify.app', // Replace with your Netlify URL
    methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow GET, POST, and OPTIONS methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));

// Handle preflight (OPTIONS) requests explicitly for all routes
app.options('*', cors());

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'outlook', // Email provider (update if needed)
    auth: {
        user: process.env.EMAIL_USER, // Sender email address
        pass: process.env.EMAIL_PASS, // Sender email password
    },
});

// Root route for testing backend connectivity
app.get('/', (req, res) => {
    res.send('Welcome to the Backend API!');
});

// POST /submit-form route for form submissions
app.post('/submit-form', (req, res) => {
    const {
        fullname, email, dob, address, city, state, zip,
        phone, emergencyName, emergencyRelationship, emergencyPhoneNumber,
        membershipType, preferredEvent, tshirt, hear, condition,
    } = req.body;

    // Validate required fields
    if (!fullname || !email) {
        return res.status(400).json({ error: 'Full Name and Email are required.' });
    }

    // Log form data for debugging
    console.log('Form data received:', req.body);

    // Send confirmation email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Membership Application Confirmation',
        text: `
            Hello ${fullname},

            Thank you for applying for membership. Your application has been received and is being reviewed. We'll follow up shortly.

            Best regards,
            Management
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send confirmation email.' });
        }

        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Form submitted successfully! Confirmation email sent.' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});