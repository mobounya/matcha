const notJoi = require("../modules/notJoi");

const signinSchema = notJoi.object({
  email: notJoi.string().trim().email().required(),
  password: notJoi.string().trim().min(8).max(64).required()
});

module.exports = { signinSchema };
