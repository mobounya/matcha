const db = require("../database/db");
const httpStatus = require("../lib/http-status");
const fs = require("fs");
const { bcryptHash, bcryptCompare } = require("../modules/bcrypt");
const { streamPicture } = require("../modules/upload-picture");
const { getUserIdFromJwt } = require("../middlewares/auth-middlewares");


const getUserIdFromRequest = (req, res, next) => {
	const userId = getUserIdFromJwt(req);
	res.locals.userId = userId;
	return next()
}

const getUserIdFromParam = (req, res, next) => {
	const userId = req.params.userId;
	res.locals.userId = userId;
	return next();
}

const savePicture = (req, res, next) => {
	const path = process.env.UPLOADS_PATH + res.locals.fileName;
	const buffer = req.file.buffer;
	streamPicture(path, buffer)
	.then(() => {
		return next();
	})
	.catch(err => {
		console.error(err);
		res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
			message: "Something went wrong"
		});
	});
}

const insertUserPicture = async (req, res, next) => {
	
	try {
		const userId = getUserIdFromJwt(req);
		const isProfile = JSON.parse(req.body.data).isProfile;
		const timeStamp = new Date();
		const now = Date.now();
		const fileName = isProfile ? 
			`profile_${userId}_${now}.${req.file.mimetype.split('/')[1]}` : 
			`${userId}_${now}.${req.file.mimetype.split('/')[1]}`;
		res.locals.fileName = fileName;

		userPictureQueryData = {
		"userId": userId,
		"fileName": fileName,
		"isProfilePicture": isProfile,
		"uploadData": timeStamp
		};

		const pictures = await db.getUserPictures(userId);

		if (isProfile) {
			const getProfilePicture = pictureElm => pictureElm.is_profile_picture;
			const profilePictureElm = pictures.find(getProfilePicture);

			if (profilePictureElm) {
				const onFailure = (err) => {
					if (err || !ret) {
						return res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
							error: "something went wrong"
						});
					};
				}				
				const pictureIdToDelete = profilePictureElm.picture_id;
				const filePathToDelete = process.env.UPLOADS_PATH + profilePictureElm.file_name;
				const ret = await db.deleteUserPicture(pictureIdToDelete);
				fs.rm(filePathToDelete, { force: true }, onFailure);
		 	}

			const uploadedPicture = await db.insertUserPicture(userPictureQueryData);
			res.locals.body = {
				message: "User picture uploaded successfully",
				data: uploadedPicture
			};
			return next();
		}
		if (pictures.length <= 4) {
			const uploadedPicture = await db.insertUserPicture(userPictureQueryData);
			if (!uploadedPicture) {
				return res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
					error: "something went wrong"
				});
			}
			res.locals.body = {
				message: "User picture uploaded successfully",
				data: uploadedPicture
			};
		} else {
			return res.status(httpStatus.HTTP_BAD_REQUEST).json({
				error: "You have reached the maximum number of uploaded pictures per profile"
			});
		}
		return next();
	} catch (e) {
		console.error(e)
		res.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
			error: "something went wrong"
		});
	}
}

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

function checkIfProfileExist(getUserId) {
  return async (request, response, next) => {
    try {
      const userId = getUserId(request);
      const profile = await db.getUserProfile(userId);
      if (profile.rows.length > 0) {
        next();
      } else {
        return response.status(httpStatus.HTTP_UNPROCESSABLE_ENTITY).json({
          error: "no such profile"
        });
      }
    } catch (e) {
      response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
        error: "something went wrong"
      });
    }
  };
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

function validateTags(request, response, next) {
  let error = null;
  const tags = request.body.tags;

  tags.find((tag) => {
    if (tag.length < 1) {
      error = "a tag cannot be empty";
      return true;
    } else if (tag.length > 10) {
      error = "a tag cannot be more than 10 characters";
      return true;
    }
    return false;
  });

  if (error) {
    response.status(httpStatus.HTTP_BAD_REQUEST).json({
      error: error
    });
  } else {
    next();
  }
}

function removeDuplicateTags(request, response, next) {
  const tags = request.body.tags;
  const uniqueTags = [];
  tags.forEach((tag) => {
    const found = uniqueTags.find((uniqueTag) => {
      return uniqueTag == tag;
    });
    if (!found) {
      uniqueTags.push(tag);
    }
  });
  request.body.tags = uniqueTags;
  next();
}

module.exports = {
  checkDuplicateEmail,
  hashPassword,
  checkIfAccountIsValid,
  validateProfileData,
  checkCredentials,
  removeDuplicateTags,
  validateTags,
  checkIfProfileExist,
	savePicture,
	insertUserPicture,
	getUserIdFromRequest,
	getUserIdFromParam
};
