const notJoi = require("../modules/notJoi");

const resetPasswordSchema = notJoi.object({
  email: notJoi.string().trim().email().required()
});

module.exports = { resetPasswordSchema };
