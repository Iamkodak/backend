const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS Configuration
app.use(cors({
    origin: 'https://mchandlermembership.netlify.app', // Replace with your actual Netlify URL
    methods: ['GET', 'POST', 'OPTIONS'], // Allow GET, POST, and OPTIONS methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow required headers
}));

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'outlook', // Change to your email provider
    auth: {
        user: process.env.EMAIL_USER, // Sender email address
        pass: process.env.EMAIL_PASS, // Sender email password or app-specific password
    },
});

// POST /submit-form Route for Form Submission
app.post('/submit-form', async (req, res) => {
    try {
        const {
            fullname, email, dob, address, city, state, zip,
            phone, emergencyName, emergencyRelationship, emergencyPhoneNumber,
            membershipType, preferredEvent, tshirt, hear, condition,
        } = req.body;

        // Validate Required Fields
        if (!fullname || !email) {
            console.error('Validation failed: Full Name or Email is missing.');
            return res.status(400).json({ error: 'Full Name and Email are required fields.' });
        }

        console.log('Form data received:', req.body);

        // Send Form Data to Admin Email
        const adminEmailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Admin email address
            subject: 'New Membership Application Received',
            text: `A new membership application has been submitted:\n\n${JSON.stringify(req.body, null, 2)}`,
        };

        await transporter.sendMail(adminEmailOptions);
        console.log('Admin email sent successfully.');

        // Prepare Confirmation Email for User
        const userEmailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Membership Application Confirmation',
            text: `
                Hello ${fullname},

                Thank you for applying for membership. Here are the details you provided:

                Date of Birth: ${dob || 'Not specified'}
                Address: ${address || 'Not specified'}, ${city || 'Not specified'}, ${state || 'Not specified'}, ${zip || 'Not specified'}
                Phone Number: ${phone || 'Not specified'}
                Emergency Contact: ${emergencyName || 'Not specified'}, ${emergencyRelationship || 'Not specified'}, ${emergencyPhoneNumber || 'Not specified'}
                Membership Type: ${membershipType || 'Not specified'}
                Preferred Event(s): ${preferredEvent || 'None'}
                T-shirt Size: ${tshirt || 'Not specified'}
                How You Heard About Us: ${hear || 'Not specified'}
                Medical Conditions or Accommodations: ${condition || 'None'}

                Your application has been received and is being reviewed. We will follow up shortly.

                Best regards,
                Management
            `,
        };

        await transporter.sendMail(userEmailOptions);
        console.log('Confirmation email sent successfully.');

        // Schedule Follow-Up Email
        setTimeout(async () => {
            const followUpEmailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Membership Application Follow-Up',
                text: `
                    Hello ${fullname},

                    We are excited to inform you that your membership application has been accepted. If you haven’t made your payment for your desired membership plan, please do so to activate your profile.

                    For further inquiries, feel free to contact us.

                    Best regards,
                    Management
                `,
            };

            try {
                await transporter.sendMail(followUpEmailOptions);
                console.log('Follow-up email sent successfully.');
            } catch (followUpError) {
                console.error('Error sending follow-up email:', followUpError);
            }
        }, 2 * 60 * 60 * 1000); // Delay of 2 hours

        // Respond to Client
        res.status(200).json({ message: 'Form submitted successfully! Confirmation email sent.' });
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});