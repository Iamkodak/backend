const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());

// Simplified CORS Configuration
app.use(cors({
    origin: 'https://mchandlermembership.netlify.app', // Replace with your Netlify URL
    methods: ['GET', 'POST', 'OPTIONS'], // Allow GET, POST, and OPTIONS methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'outlook', // Email service provider
    auth: {
        user: process.env.EMAIL_USER, // Sender email address
        pass: process.env.EMAIL_PASS, // Sender email password
    },
});

// Root Route
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

    // Validate Required Fields
    if (!fullname || !email) {
        console.log('Validation failed: Fullname or email is missing.');
        return res.status(400).json({ error: 'Full Name and Email are required fields.' });
    }

    console.log('Form data received:', req.body);

    // Prepare Email Confirmation
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Membership Application Confirmation',
        text: `
            Hello ${fullname},

            Thank you for applying for membership. Here are the details you provided:

            Date of Birth: ${dob}
            Address: ${address}, ${city}, ${state}, ${zip}
            Phone Number: ${phone}
            Emergency Contact: ${emergencyName}, ${emergencyRelationship}, ${emergencyPhoneNumber}
            Membership Type: ${membershipType}
            Preferred Event(s): ${preferredEvent || 'None'}
            T-shirt Size: ${tshirt}
            How You Heard About Us: ${hear || 'Not specified'}
            Medical Conditions or Accommodations: ${condition || 'None'}

            Your application has been received and is being reviewed. We will follow up shortly.

            Best regards,
            Management
        `,
    };

    // Send Confirmation Email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error); // Log the error clearly
            return res.status(500).json({ error: 'Failed to send confirmation email.', details: error.message });
        }
        console.log('Email sent successfully:', info.response);
        res.status(200).json({ message: 'Form submitted successfully! Confirmation email sent.' });
    });
});
        

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});