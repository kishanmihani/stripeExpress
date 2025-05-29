// server.js
const nodemailer = require("nodemailer"); 
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const PORT =   process.env.PORT || 4000 ;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe with secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST endpoint to create a payment intent
app.get("/app-status", async (req, res) => {
  const transporter = nodemailer.createTransport({
    host:"https://stripeexpress-1.onrender.com",
    // port: 465,
    secure: true,
    service: "gmail",
    auth: {
      user: "kishanmihani865@gmail.com",
      pass: "kishan@865865865", // ⚠️ WARNING: Move to .env for security
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Kishan Mihani" <kishanmihani865@gmail.com>',
      to: "kishanmihani918@gmail.com",
      subject: "Hello ✔",
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });

    res.send(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email",error);
  }
});

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'usd', description } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).send({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
