const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using your email service (e.g., Gmail, SendGrid)
  const transporter = nodemailer.createTransport({
    // Configure your email service here
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };