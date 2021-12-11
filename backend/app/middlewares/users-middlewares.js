const db = require("../database/db");
const httpStatus = require("../lib/http-status");
const { bcryptHash } = require("../modules/bcrypt");
const { jwtSignPayload } = require("../modules/jwt");
const { sendMail } = require("../modules/nodemailer");

async function checkDuplicateEmail(request, response, next) {
  try {
    const email = request.body.email;
    const data = await db.getUserByEmail(email);
    if (data.rowCount > 0) {
      response.status(httpStatus.HTTP_CONFLICT).json({
        error: "DUPLICATE_KEY",
        key: "email"
      });
    } else {
      next();
    }
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

async function hashPassword(request, response, next) {
  try {
    const password = request.body.password;
    const hashedPassword = await bcryptHash(password);
    request.body.password = hashedPassword;
    next();
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

async function checkIfAccountIsValid(request, response, next) {
  try {
    const email = request.body.email;
    const data = await db.getUserByEmail(email);
    if (data.rowCount > 0) {
      next();
    } else {
      response.status(httpStatus.HTTP_BAD_REQUEST).json({
        error: "No account is associated with the email provided"
      });
    }
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

function generateEmailVerificationToken(email) {
  const payload = { email: email };
  const secretKey = process.env.JWT_EMAIL_VERIFICATION_SECRET_KEY;
  const expiration = "1d";
  return jwtSignPayload(payload, secretKey, expiration);
}

async function sendAccountVerificationEmail(request, response) {
  try {
    const email = request.body.email;
    const token = await generateEmailVerificationToken(email);
    const address = request.hostname;
    const port = 3000;
    const link = `http://${address}:${port}/token=${token}`;

    const subject = "Please verify your email | matcha";
    const emailText = `Please <a href="${link}">click here</a> to verify your email`;

    sendMail(email, subject, emailText).catch();

    response.status(httpStatus.HTTP_OK).json({
      message: "Email is sent"
    });
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

module.exports = {
  checkDuplicateEmail,
  hashPassword,
  checkIfAccountIsValid,
  sendAccountVerificationEmail
};
