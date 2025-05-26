// server.js
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const PORT =  4242;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe with secret key
const stripe = Stripe('sk_test_tR3PYbcVNZZ796tH88S4VQ2u');

// POST endpoint to create a payment intent
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
