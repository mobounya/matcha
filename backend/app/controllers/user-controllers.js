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

module.exports = { insertUser, verifyEmail, changeUserPassword };
