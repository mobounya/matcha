const db = require("../database/db");
const httpStatus = require("../lib/http-status");
const { bcryptHash, bcryptCompare } = require("../modules/bcrypt");
const { jwtSignPayload } = require("../modules/jwt");
const { sendMail } = require("../modules/nodemailer");

async function checkDuplicateEmail(request, response, next) {
  try {
    const email = request.body.email;
    const data = await db.getUserByEmail(email);
    if (data) {
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

function checkIfAccountIsValid(getEmail) {
  return async (request, response, next) => {
    try {
      const email = getEmail(request);
      const data = await db.getUserByEmail(email);
      if (data) {
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
  };
}

function generateEmailVerificationToken(email) {
  const payload = { email: email };
  const secretKey = process.env.JWT_EMAIL_VERIFICATION_SECRET_KEY;
  const expiration = "1d";
  return jwtSignPayload(payload, secretKey, expiration);
}

function generateResetPasswordToken(email) {
  const payload = { email };
  const secretKey = process.env.JWT_RESET_PASSWORD_SECRET_KEY;
  const expiration = "1h";
  return jwtSignPayload(payload, secretKey, expiration);
}

async function sendAccountVerificationEmail(request, response) {
  try {
    const email = request.body.email;
    const token = await generateEmailVerificationToken(email);
    const address = request.hostname;
    const port = 3000;
    // need to change link later
    const link = `http://${address}:${port}/users/verify-account?token=${token}`;

    const subject = "Please verify your email | matcha";
    const emailText = `Please <a href="${link}">click here</a> to verify your email`;

    sendMail(email, subject, emailText).catch();

    response.status(httpStatus.HTTP_OK).json({
      message: "verification email is sent"
    });
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

async function sendResetPasswordVerificationEmail(request, response) {
  try {
    const email = request.body.email;
    const token = await generateResetPasswordToken(email);
    const address = request.hostname;
    const port = 3000;
    // need to change link later
    const link = `http://${address}:${port}/users/reset-password?token=${token}`;

    const subject = "Reset your password | matcha";
    const emailText = `Please <a href="${link}">click here</a> to reset your password`;

    sendMail(email, subject, emailText).catch();

    response.status(httpStatus.HTTP_OK).json({
      message: "reset password email is sent"
    });
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

// the req obj of the following middleware contains an additional user id property
async function checkCredentials(req, res, next) {
  try {
    const email = req.body.email;
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(httpStatus.HTTP_UNAUTHORIZED).json({
        message: "Auth fail"
      });
    }

    const hash = user.password;
    const plainTextPassword = req.body.password;

    const isMatched = await bcryptCompare(plainTextPassword, hash);

    if (!isMatched) {
      return res.status(httpStatus.HTTP_UNAUTHORIZED).json({
        message: "Auth fail"
      });
    }
    req.userId = user.id;
    next();
  } catch (e) {
    return res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

function validateProfileData(request, response, next) {
  const errors = [];
  const availableGenders = new Map([
    ["female", "f"],
    ["male", "m"]
  ]);
  const availableSexualPreferences = ["heterosexual", "homosexual", "bisexual"];
  const gender = request.body.gender;
  const sexualPreference = request.body.sexualPreference;
  if (!availableGenders.get(gender)) {
    errors.push({
      key: "gender",
      code: "INVALID_KEY"
    });
  }
  if (!availableSexualPreferences.includes(sexualPreference)) {
    errors.push({
      key: "sexualPreference",
      code: "INVALID_KEY"
    });
  }
  if (errors.length > 0) {
    response.status(httpStatus.HTTP_BAD_REQUEST).json({
      errors: errors
    });
  } else {
    // just to map a user supplied gender to a corresponding letter, we only store a letter in the database, m for male, f for female.
    request.body.gender = availableGenders.get(gender);
    next();
  }
}

module.exports = {
  checkDuplicateEmail,
  hashPassword,
  checkIfAccountIsValid,
  sendAccountVerificationEmail,
  sendResetPasswordVerificationEmail,
  validateProfileData,
  checkCredentials
};
