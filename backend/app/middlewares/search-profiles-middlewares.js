const db = require("../database/db");
const httpStatus = require("../lib/http-status");

function getPreferedGender(gender, orientation) {
  const maleOrientationsMap = new Map([
    ["heterosexual", "f"],
    ["homosexual", "m"]
  ]);

  const femaleOrientationsMap = new Map([
    ["heterosexual", "m"],
    ["homosexual", "f"]
  ]);

  const orientationMap = new Map([
    ["m", maleOrientationsMap],
    ["f", femaleOrientationsMap]
  ]);

  return orientationMap.get(gender).get(orientation);
}

/*
  This function is suppose to get data about what "interesting" profiles to match
  for a user.

  TODO: Need more data to do a decent match.
  TODO: Need to allow query params and filter based on that.
*/

async function getProfileDataToMatch(request, response, next) {
  try {
    const userId = request.jwtPayload.userId;
    const userProfile = await db.getUserProfile(userId);
    const userTags = await db.fetchUserTags(userId);

    // Get the perefered gender for the user
    const preferedGender = getPreferedGender(
      userProfile.rows[0].gender,
      userProfile.rows[0].sexual_preference
    );

    // Get profiles with common tags with the user
    let userIdsWithCommonTags = await db.getUserTagsByName(
      userTags.map((tag) => {
        return tag.tag;
      })
    );
    userIdsWithCommonTags = userIdsWithCommonTags.rows.map((element) => {
      return element.user_id;
    });

    // Get user profiles with the specified gender
    const matchedProfiles = await db.matchProfiles(
      userIdsWithCommonTags,
      preferedGender
    );

    response.status(httpStatus.HTTP_OK).json({
      data: matchedProfiles
    });
  } catch (error) {
    response.status(httpStatus.HTTP_INTERNAL_SERVER_ERROR).json({
      error: "something went wrong"
    });
  }
}

module.exports = { getProfileDataToMatch };
