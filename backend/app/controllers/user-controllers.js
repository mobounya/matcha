const { createUser, changeEmailVerifiedValue } = require("../database/db");
const httpStatus = require("../lib/http-status");

async function insertUser(request, response) {
  try {
    const res = await createUser(request.body);
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
    const email = request.body.email;
    const isVerified = true;
    await changeEmailVerifiedValue(email, isVerified);
    response.status(httpStatus.HTTP_OK).json({
      message: "email is verified"
    });
  } catch (error) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

module.exports = { insertUser, verifyEmail };
