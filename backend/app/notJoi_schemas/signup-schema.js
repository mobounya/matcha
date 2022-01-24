const notJoi = require("../modules/notJoi");

const signupSchema = notJoi.object({
  email: notJoi.string().trim().email().required(),
  username: notJoi.string().trim().min(3).max(30).required(),
  password: notJoi.string().trim().min(8).max(64).required()
});

module.exports = { signupSchema };
