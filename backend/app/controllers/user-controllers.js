const db = require("../database/db");
const httpStatus = require("../lib/http-status");

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
      secure: process.env.NODE_ENV === "production" ? true : false
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

module.exports = {
  insertUser,
  verifyEmail,
  changeUserPassword,
  addUserProfile,
  checkDuplicateProfile,
  sendAuthToken
};
