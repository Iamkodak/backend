const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

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

    // Validate input (you can add more validation logic as needed)
    if (!fullname || !dob || !address || !city || !state || !zip || !phone || !email || !membershipType) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    console.log('Form received:', req.body);

    // Schedule an auto-reply email
    setTimeout(() => {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email address
            to: email, // Recipient email
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

                We will review your application and respond shortly.

                Best regards,
                Mike Chandler Management
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent successfully:', info.response);
            }
        });
    }, 24 * 60 * 60 * 1000); // Delay by 24 hours

    res.status(200).json({ message: 'Form submitted successfully! Auto-reply email will be sent after 24 hours.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});