const nodemailer = require("nodemailer");

process.env.MAIL_USERNAME = "amine.bounya20@gmail.com";
process.env.MAIL_PASSWORD =
  "a0JLJW39ScQ7S41@G4fmd#qhw*NyRWWzaVl^jEQ$ae#j$5o7Yh";
process.env.OAUTH_CLIENTID =
  "578059032665-p5grfdtptca7oi6u07lssn4dnlirds3i.apps.googleusercontent.com";

process.env.OAUTH_CLIENT_SECRET = "h8t8NgDiU7Ey9kDgBwljg2cM";

process.env.OAUTH_REFRESH_TOKEN =
  "1//04wNP6xncU7irCgYIARAAGAQSNwF-L9IreqR8fnWsHrikCcAwXeBuKe3NvoM3xEXzG4nGH5tHiA89XOIrlL9bq7LStRDcg2SnOTA";

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

function sendMail(recepient, subject, text) {
  let mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: recepient,
    subject: subject,
    html: `<p>${text}</p>`
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
