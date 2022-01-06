const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN
  }
});

function sendMail(recipient, subject, text) {
  let mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: recipient,
    subject: subject,
    html: `<p>${text}</p>`
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
