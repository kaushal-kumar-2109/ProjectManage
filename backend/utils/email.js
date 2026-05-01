const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard for typical gmail configs
    auth: {
      user: process.env.HOST_EMAIL,
      pass: process.env.HOST_PASS,
    },
  });

  const mailOptions = {
    from: `"Projex App" <${process.env.HOST_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
