const db = require("../database/db");
const httpStatus = require("../lib/http-status");
const { sendMail } = require("../modules/nodemailer");
const { jwtSignPayload } = require("../modules/jwt");

async function insertUser(request, response) {
  try {
    const res = await db.createUser(request.body);
    response.status(httpStatus.HTTP_CREATED).json({
      message: "User created successfully",
      data: res.rows[0]
    });
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

async function verifyEmail(request, response) {
  try {
    const email = request.decodedPayload.email;
    const isVerified = true;
    await db.changeEmailVerifiedValue(email, isVerified);
    response.status(httpStatus.HTTP_OK).json({
      message: "email is verified"
    });
  } catch (error) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

function changeUserPassword(getUserEmail) {
  return async (request, response) => {
    try {
      const email = getUserEmail(request);
      const password = request.body.password;

      await db.changeUserPassword(email, password);
      response.status(httpStatus.HTTP_OK).json({
        message: "password updated successfully"
      });
    } catch (error) {
      response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
        error: "something went wrong"
      });
    }
  };
}

async function sendAuthToken(req, res) {
  try {
    const token = req.token;
    const oneHourInMilliseconds = 60 * 60 * 1000;
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: true,
      maxAge: oneHourInMilliseconds,
      secure: process.env.NODE_ENV === "production"
    });
    res
      .status(httpStatus.HTTP_OK)
      .json({ message: "user authenticated successfully" });
  } catch (e) {
    return res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

async function addUserProfile(request, response) {
  try {
    const userId = request.jwtPayload.userId;
    const { gender, sexualPreference, biography } = request.body;
    const profile = await db.addUserProfile(
      userId,
      gender,
      sexualPreference,
      biography
    );
    response.status(httpStatus.HTTP_CREATED).json({
      message: "profile created",
      data: profile.rows[0]
    });
  } catch (error) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

function checkDuplicateProfile(getUserId) {
  return async (request, response, next) => {
    try {
      const userId = getUserId(request);
      const profile = await db.getUserProfile(userId);
      if (profile.rows.length > 0) {
        return response.status(httpStatus.HTTP_CONFLICT).json({
          error: "profile already exist"
        });
      }
      next();
    } catch (error) {
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

async function sendResetPasswordEmail(request, response) {
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

async function addUserTags(request, response) {
  const suppliedTags = request.body.tags;
  const userId = request.jwtPayload.userId;
  try {
    await db.addTags(suppliedTags);
    const tags = await db.getTags(suppliedTags);
    const tagIds = tags.rows.map((tag) => {
      return tag.id;
    });
    const userTags = await db.addUserTags(userId, tagIds);
    response.status(httpStatus.HTTP_CREATED).json({
      message: "tags created",
      data: userTags.rows
    });
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

function editProfile(getUserId) {
  return async (request, response) => {
    const userId = getUserId(request);
    try {
      const profile = await db.editUserProfile(
        {
          gender: request.body.gender,
          sexualPreference: request.body.sexualPreference,
          biography: request.body.biography
        },
        userId
      );
      response.status(httpStatus.HTTP_OK).json({
        message: "Profile edited successfully",
        data: profile.rows
      });
    } catch (e) {
      console.log(e);
      response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
        error: "something went wrong"
      });
    }
  };
}

module.exports = {
  insertUser,
  verifyEmail,
  changeUserPassword,
  addUserProfile,
  checkDuplicateProfile,
  sendAuthToken,
  addUserTags,
  sendResetPasswordEmail,
  sendAccountVerificationEmail,
  editProfile
};
