const notJoi = require("../modules/notJoi");

const profileSchema = notJoi.object({
  firstName: notJoi.string().trim().min(3).max(35).required(),
  lastName: notJoi.string().trim().min(3).max(35).required(),
  gender: notJoi.string().trim().min(4).max(6).required().lowercase(),
  sexualPreference: notJoi
    .string()
    .trim()
    .min(1)
    .max(12)
    .lowercase()
    .required(),
  biography: notJoi.string().trim().min(1).max(100).required()
});

module.exports = { profileSchema };
