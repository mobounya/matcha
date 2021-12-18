const notJoi = require("../modules/notJoi");

const verifyEmailSchema = notJoi.object({
  email: notJoi.string().trim().email().required()
});

module.exports = { verifyEmailSchema };
