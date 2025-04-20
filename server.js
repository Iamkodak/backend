const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS configuration
app.use(cors({
    origin: 'https://mchandlermembership.netlify.app', // Replace with your exact frontend URL
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type'], // Allow specific headers
}));

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL_USER, // Environment variable for email address
        pass: process.env.EMAIL_PASS, // Environment variable for email password
    },
});

// Endpoint for form submission
app.post('/submit-form', (req, res) => {
    const {
        fullname, dob, address, city, state, zip, phone, email,
        emergencyName, emergencyRelationship, emergencyPhoneNumber,
        membershipType, preferredEvent, tshirt, hear, condition,
    } = req.body;

    // Validate input
    if (!fullname || !dob || !address || !city || !state || !zip || !phone || !email || !membershipType) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    console.log('Form received:', req.body);

    // Send an immediate email confirmation
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Membership Application Confirmation',
        text: `
            Hello ${fullname},

            Thank you for applying for membership with Mike Chandler Management. Here are the details you provided:

            Date of Birth: ${dob}
            Address: ${address}, ${city}, ${state}, ${zip}
            Phone Number: ${phone}
            Emergency Contact: ${emergencyName}, ${emergencyRelationship}, ${emergencyPhoneNumber}
            Membership Type: ${membershipType}
            Preferred Event(s): ${preferredEvent || 'None'}
            T-shirt Size: ${tshirt}
            How You Heard About Us: ${hear || 'Not specified'}
            Medical Conditions or Accommodations: ${condition || 'None'}

            Your application has been received. We will follow up soon.

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

        // Schedule an automated reply after 24 hours
        setTimeout(() => {
            const autoReplyOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Membership Application Follow-Up',
                text: `
                    Hello ${fullname},

                    We are excited to inform you that your membership application has been accepted. If you haven’t made your payment for your desired membership plan, please do so to activate your profile.

                    For further inquiries, feel free to contact us.

                    Best regards,
                    Mike Chandler Management
                `,
            };

            transporter.sendMail(autoReplyOptions, (autoError, autoInfo) => {
                if (autoError) {
                    console.error('Error sending automated reply:', autoError);
                } else {
                    console.log('Automated reply sent successfully:', autoInfo.response);
                }
            });
        }, 24 * 60 * 60 * 1000); // Delay of 24 hours
    });

    res.status(200).json({ message: 'Form submitted successfully! Confirmation email sent.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});