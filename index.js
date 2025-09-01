// server.js
const nodemailer = require("nodemailer");
require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe with secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Email API
app.post("/send-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,      // आपका Gmail
        pass: process.env.EMAIL_PASS, // App Password (16 char)
      },
    });

    // Receiver को mail
    const mailToReceiver = {
      from: `"Kishan Mihani" <${process.env.EMAIL}>`,
      to: req.body.to,
      subject: req.body.subject || "Hello ✔",
      text: req.body.text || "Hello world?",
      html: req.body.html || "<b>Hello world?</b>",
    };

    // Sender (आपका Gmail) को confirmation mail
    const mailToSender = {
      from: `"Kishan Mihani" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: "📩 Copy of your sent email ✔",
      text: `You just sent an email to ${req.body.to}\n\nMessage: ${req.body.text}`,
      html: `
        <h2>Confirmation: Email Sent</h2>
        <p><b>To:</b> ${req.body.to}</p>
        <p><b>Subject:</b> ${req.body.subject}</p>
        <p><b>Message:</b></p>
        <div style="padding:10px;border:1px solid #ddd;border-radius:5px;">
          ${req.body.html || req.body.text}
        </div>
      `,
    };

    // दोनों mails parallel भेजें
    const [infoReceiver, infoSender] = await Promise.all([
      transporter.sendMail(mailToReceiver),
      transporter.sendMail(mailToSender),
    ]);

    res.status(200).json({
      success: true,
      message: "✅ Email sent to receiver and confirmation sent to sender",
      receiverMessageId: infoReceiver.messageId,
      senderMessageId: infoSender.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "❌ Failed to send email",
      error: error.message,
    });
  }
});

// ✅ Stripe API
app.post("/create-payment-intent", async (req, res) => {
  const { amount, currency = "usd", description } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
