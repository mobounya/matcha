const db = require("../database/db");
const httpStatus = require("../lib/http-status");
const { bcryptHash } = require("../modules/bcrypt");

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

module.exports = { checkDuplicateEmail, hashPassword, checkIfAccountIsValid };
