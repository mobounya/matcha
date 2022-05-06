const db = require("../database/db");
const httpStatus = require("../lib/http-status");
const { sendMail } = require("../modules/nodemailer");
const { jwtSignPayload } = require("../modules/jwt");
const fs = require("fs");

const sendUserResponse = (req, res) => {
  res.status(httpStatus.HTTP_CREATED).json(res.locals.body);
}

const sendFile  = (res, path) => {
	return new Promise(
		(resolve, reject) => {
			res.sendFile(path, (err) => {
				if (err) {
					reject(err);
				}
				resolve();
			})
		}
	)
}

const deleteUserPictureByPictureId = async (req, res) => {
	try {
		const onFailure = (err) => {
			if (err || !ret) {
				return res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
					error: "something went wrong"
				});
			};
		}				
		const pictureIdToDelete = req.params.pictureId;
		const filePathToDelete = process.env.UPLOADS_PATH + res.locals.fileName;
		const ret = await db.deleteUserPicture(pictureIdToDelete);
		fs.rm(filePathToDelete, { force: true }, onFailure);
		console.log(res.locals.fileName);
		res.status(httpStatus.HTTP_OK).json({
			message: "picture has been deleted successfully",
			data: {
				pictureId: pictureIdToDelete
			}
		});
	} catch (e) {
		console.error(e);
		res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
			message: "Something went wrong"
		});
	}
}

const getUserPicture = async (req, res) => {
	try {
		const filePath = process.env.UPLOADS_PATH;
		const pictureId = req.params.pictureId;
		const fileName = await db.getFileNameByPictureId(pictureId);
		const path  = `${filePath}/${fileName}`;
		await sendFile(res, path);
	} catch (e) {
		console.error(e);
		res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
	}
}

const getUserProfilePicture = async (req, res) => {
	try {
		const filePath = process.env.UPLOADS_PATH;
		const userId = req.params.userId;
		const fileName = await db.getProfilePictureFileNameByUserId(userId);
		const path  = `${filePath}/${fileName}`;
		await sendFile(res, path);
		res.json()
	} catch (e) {
		console.error(e);
		res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
	}
}

const getUserPicturesIds = async (req, res) => {
	try {
		const userId = parseInt(res.locals.userId);
		const pictures = await db.getUserPictures(userId);

		const getUserPictures = (elm) => {
			return {
				picture_id: elm.picture_id,
				isProfile: elm.is_profile_picture
			}
		}
		const userPictures = pictures.map(getUserPictures);

		res.status(httpStatus.HTTP_OK).json({
			data: userPictures
		})
	} catch (e) {
		console.error(e)
	}
}

async function insertUser(request, response) {
  try {
    const user = await db.createUser(request.body);
    response.status(httpStatus.HTTP_CREATED).json({
      message: "User created successfully",
      data: user
    });
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

async function getUserAccount(request, response) {
  try {
    const userId = request.jwtPayload.userId;
    const userAccount = await db.getUserAccountById(userId);
    response.status(httpStatus.HTTP_OK).json({
      data: {
        id: userAccount.id,
        email: userAccount.email,
        username: userAccount.username,
        is_active: userAccount.is_active
      }
    });
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

async function editUserAccount(request, response, next) {
  try {
    const userId = request.jwtPayload.userId;
    const accountData = request.body;
    const oldAccountData = await db.getUserAccountById(userId);
    const newAccount = await db.editUserAccount(accountData, userId);
    if (oldAccountData.email != newAccount.email) {
      const isVerified = false;
      await db.changeEmailVerifiedValue(newAccount.email, isVerified);
    }
    response.status(httpStatus.HTTP_OK).json({
      message: "account edited successfully",
      data: {
        id: newAccount.id,
        email: newAccount.email,
        username: newAccount.username,
        isVerified: newAccount.email_verified
      }
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

function changeUserPassword(getUserId) {
  return async (request, response) => {
    try {
      const id = getUserId(request);
      const password = request.body.password;

      await db.changeUserPassword(id, password);
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
    const { firstName, lastName, gender, sexualPreference, biography } =
      request.body;
    const profile = await db.addUserProfile(
      userId,
      firstName,
      lastName,
      gender,
      sexualPreference,
      biography
    );
    response.status(httpStatus.HTTP_CREATED).json({
      message: "profile created",
      data: profile
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

function getUserProfile(getUserID) {
  return async (request, response) => {
    try {
      const userId = getUserID(request);
      const userProfile = await db.getUserProfile(userId);
      response.status(httpStatus.HTTP_OK).json({
        data: {
          id: userProfile.rows[0].id,
          firstName: userProfile.rows[0].first_name,
          lastName: userProfile.rows[0].last_name,
          gender: userProfile.rows[0].gender,
          sexualPreference: userProfile.rows[0].sexual_preference,
          biography: userProfile.rows[0].biography
        }
      });
    } catch (error) {
      response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
        error: "something went wrong"
      });
    }
  };
}

function generateEmailVerificationToken(userId, email) {
  const payload = { userId: userId, email: email };
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
    const userId = request.jwtPayload.userId;
    const userData = await db.getUserAccountById(userId);
    const email = userData.email;
    const token = await generateEmailVerificationToken(userId, email);
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
    const tagIds = tags.map((tag) => {
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

function getUserTags(getUserId) {
  return async (request, response) => {
    try {
      const userId = getUserId(request);
      const userTags = await db.fetchUserTags(userId);
      response.status(httpStatus.HTTP_OK).json({
        data: userTags
      });
    } catch (e) {
      response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
        error: "something went wrong"
      });
    }
  };
}

function editProfile(getUserId) {
  return async (request, response) => {
    const userId = getUserId(request);
    try {
      const profile = await db.editUserProfile(
        {
          firstName: request.body.firstName,
          lastName: request.body.lastName,
          gender: request.body.gender,
          sexualPreference: request.body.sexualPreference,
          biography: request.body.biography
        },
        userId
      );
      response.status(httpStatus.HTTP_OK).json({
        message: "Profile edited successfully",
        data: profile
      });
    } catch (e) {
      response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
        error: "something went wrong"
      });
    }
  };
}

async function removeTags(request, response) {
  const suppliedTags = request.body.tags;
  const userId = request.jwtPayload.userId;
  try {
    const tags = await db.getTags(suppliedTags);
    if (tags) {
      const tagIds = tags.map(function getTagId(tag) {
        return tag.id;
      });
      await db.deleteUserTags(tagIds, userId);
    }
    response.status(httpStatus.HTTP_OK).json({
      message: "tags removed successfully"
    });
  } catch (e) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
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
  editProfile,
  removeTags,
  getUserTags,
  getUserAccount,
  editUserAccount,
  getUserProfile,
  sendUserResponse,
	getUserPicturesIds,
	getUserPicture,
	getUserProfilePicture,
	deleteUserPictureByPictureId
};
